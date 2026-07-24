import { v4 as uuidv4 } from 'uuid';
import NodeMediaServer from 'node-media-server';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';
import type {
  Broadcast,
  BroadcastState,
  StreamingStartedPayload,
  StreamingEndedPayload,
  ViewerCountPayload,
} from '../types/streaming';

/**
 * RtmpService manages the node-media-server lifecycle and keeps the in-memory
 * broadcast registry in sync with real RTMP publish/play events.
 *
 * Architecture:
 *   - Broadcasters push via RTMP:  rtmp://host:<RTMP_PORT>/live/<streamKey>
 *   - Viewers pull via HLS:        http://host:<HTTP_PORT>/live/<streamKey>/index.m3u8
 *
 * Socket.IO rooms named by broadcastId are used to push real-time state
 * updates (stream started, stream ended, viewer count) to web/mobile clients.
 *
 * Scaling note: the broadcast map is in-process for the MVP.  Replace with
 * Redis for horizontal scaling without changing the public interface.
 */
export class RtmpService {
  /** broadcastId → Broadcast */
  public readonly broadcasts = new Map<string, Broadcast>();

  /** streamKey → broadcastId (reverse index for O(1) lookup in RTMP callbacks) */
  private readonly keyToBroadcastId = new Map<string, string>();

  /** streamKey → current viewer count */
  private readonly viewerCounts = new Map<string, number>();

  private nms: InstanceType<typeof NodeMediaServer> | null = null;

  private readonly rtmpPort: number;
  private readonly httpPort: number;
  private readonly mediaRoot: string;

  constructor(private readonly io: SocketIOServer) {
    this.rtmpPort = parseInt(process.env.RTMP_PORT ?? '1935', 10);
    this.httpPort = parseInt(process.env.RTMP_HTTP_PORT ?? '8000', 10);
    this.mediaRoot = process.env.RTMP_MEDIA_ROOT ?? './media';
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  public start(): void {
    this.nms = new NodeMediaServer({
      logType: 1, // 0 = none, 1 = error, 2 = normal, 3 = debug
      rtmp: {
        port: this.rtmpPort,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: this.httpPort,
        mediaroot: this.mediaRoot,
        allow_origin: '*',
      },
    });

    this.registerNmsEvents();
    this.nms.run();

    logger.info(`RTMP: server started — rtmp://0.0.0.0:${this.rtmpPort}/live/<streamKey>`);
    logger.info(`RTMP: HLS endpoint  — http://0.0.0.0:${this.httpPort}/live/<streamKey>/index.m3u8`);
  }

  // ---------------------------------------------------------------------------
  // Broadcast CRUD (called by REST controller)
  // ---------------------------------------------------------------------------

  public createBroadcast(title: string, hostUserId: string): Broadcast {
    const now = new Date().toISOString();
    const broadcast: Broadcast = {
      id: uuidv4(),
      title: title.trim(),
      hostUserId,
      streamKey: uuidv4().replace(/-/g, ''),
      state: 'created',
      createdAt: now,
      updatedAt: now,
      startedAt: null,
      endedAt: null,
      viewerCount: 0,
    };

    this.broadcasts.set(broadcast.id, broadcast);
    this.keyToBroadcastId.set(broadcast.streamKey, broadcast.id);

    logger.info(`RTMP: broadcast created id=${broadcast.id} host=${hostUserId}`);

    return broadcast;
  }

  public getBroadcast(id: string): Broadcast | undefined {
    return this.broadcasts.get(id);
  }

  public listBroadcasts(state?: BroadcastState): Broadcast[] {
    const all = Array.from(this.broadcasts.values());
    return state ? all.filter((b) => b.state === state) : all;
  }

  /**
   * Manually end a broadcast (e.g. host presses "Stop").
   * Also called internally when the RTMP connection drops.
   */
  public endBroadcast(id: string): Broadcast | undefined {
    const broadcast = this.broadcasts.get(id);
    if (!broadcast) return undefined;

    if (broadcast.state === 'ended') return broadcast;

    const now = new Date().toISOString();
    const updated: Broadcast = {
      ...broadcast,
      state: 'ended',
      updatedAt: now,
      endedAt: broadcast.endedAt ?? now,
    };

    this.broadcasts.set(id, updated);
    this.keyToBroadcastId.delete(broadcast.streamKey);

    this.emitStreamEnded(updated);

    logger.info(`RTMP: broadcast ended id=${id}`);

    return updated;
  }

  // ---------------------------------------------------------------------------
  // URL helpers
  // ---------------------------------------------------------------------------

  public buildRtmpUrl(streamKey: string): string {
    const host = process.env.RTMP_PUBLIC_HOST ?? 'localhost';
    return `rtmp://${host}:${this.rtmpPort}/live/${streamKey}`;
  }

  public buildHlsUrl(streamKey: string): string {
    const host = process.env.RTMP_PUBLIC_HOST ?? 'localhost';
    return `http://${host}:${this.httpPort}/live/${streamKey}/index.m3u8`;
  }

  // ---------------------------------------------------------------------------
  // Private — NMS event wiring
  // ---------------------------------------------------------------------------

  private registerNmsEvents(): void {
    if (!this.nms) return;

    /**
     * prePublish fires when a broadcaster connects and attempts to push RTMP.
     * session.streamPath = '/live/<streamKey>'
     * Reject unknown stream keys to prevent unauthorized publishing.
     */
    this.nms.on('prePublish', (session: any) => {
      const streamKey = this.extractStreamKey(session.streamPath as string);
      const broadcastId = this.keyToBroadcastId.get(streamKey);

      if (!broadcastId) {
        logger.warn(`RTMP: rejected unknown streamKey="${streamKey}"`);
        session.reject();
        return;
      }

      const broadcast = this.broadcasts.get(broadcastId);
      if (!broadcast || broadcast.state === 'ended') {
        logger.warn(`RTMP: rejected ended/unknown broadcast id=${broadcastId}`);
        session.reject();
        return;
      }

      logger.info(`RTMP: publisher connecting streamKey="${streamKey}" broadcastId=${broadcastId}`);
    });

    /**
     * postPublish fires once RTMP negotiation succeeds and data starts flowing.
     */
    this.nms.on('postPublish', (session: any) => {
      const streamKey = this.extractStreamKey(session.streamPath as string);
      const broadcastId = this.keyToBroadcastId.get(streamKey);
      if (!broadcastId) return;

      const broadcast = this.broadcasts.get(broadcastId);
      if (!broadcast) return;

      const now = new Date().toISOString();
      const updated: Broadcast = {
        ...broadcast,
        state: 'live',
        updatedAt: now,
        startedAt: broadcast.startedAt ?? now,
      };

      this.broadcasts.set(broadcastId, updated);
      this.emitStreamStarted(updated);

      logger.info(`RTMP: stream live broadcastId=${broadcastId}`);
    });

    /**
     * donePublish fires when the broadcaster's RTMP connection closes.
     */
    this.nms.on('donePublish', (session: any) => {
      const streamKey = this.extractStreamKey(session.streamPath as string);
      const broadcastId = this.keyToBroadcastId.get(streamKey);
      if (!broadcastId) return;

      this.endBroadcast(broadcastId);
    });

    /**
     * postPlay / donePlay update the viewer count for the broadcast room.
     */
    this.nms.on('postPlay', (session: any) => {
      const streamKey = this.extractStreamKey(session.streamPath as string);
      this.incrementViewerCount(streamKey, +1);
    });

    this.nms.on('donePlay', (session: any) => {
      const streamKey = this.extractStreamKey(session.streamPath as string);
      this.incrementViewerCount(streamKey, -1);
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** '/live/abc123' → 'abc123' */
  private extractStreamKey(streamPath: string): string {
    const parts = streamPath.split('/');
    return parts[parts.length - 1] ?? '';
  }

  private incrementViewerCount(streamKey: string, delta: number): void {
    const current = this.viewerCounts.get(streamKey) ?? 0;
    const next = Math.max(0, current + delta);
    this.viewerCounts.set(streamKey, next);

    const broadcastId = this.keyToBroadcastId.get(streamKey);
    if (!broadcastId) return;

    const broadcast = this.broadcasts.get(broadcastId);
    if (!broadcast) return;

    const updated: Broadcast = {
      ...broadcast,
      viewerCount: next,
      updatedAt: new Date().toISOString(),
    };
    this.broadcasts.set(broadcastId, updated);

    const payload: ViewerCountPayload = { broadcastId, viewerCount: next };
    this.io.to(broadcastId).emit('streaming:viewer-count', payload);
  }

  private emitStreamStarted(broadcast: Broadcast): void {
    const payload: StreamingStartedPayload = {
      broadcastId: broadcast.id,
      streamKey: broadcast.streamKey,
      hostUserId: broadcast.hostUserId,
    };
    this.io.emit('streaming:started', payload);
  }

  private emitStreamEnded(broadcast: Broadcast): void {
    const payload: StreamingEndedPayload = {
      broadcastId: broadcast.id,
      streamKey: broadcast.streamKey,
      hostUserId: broadcast.hostUserId,
    };
    this.io.to(broadcast.id).emit('streaming:ended', payload);
  }
}
