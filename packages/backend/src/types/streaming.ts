/**
 * Type definitions for the RTMP live-streaming feature.
 *
 * Broadcasters push a stream via RTMP (e.g. OBS → rtmp://host:1935/live/<streamKey>).
 * Viewers consume the stream via HLS (http://host:8000/live/<streamKey>/index.m3u8).
 */

// ---------------------------------------------------------------------------
// Core domain models
// ---------------------------------------------------------------------------

export type BroadcastState =
  | 'created'   // room exists but no RTMP connection yet
  | 'live'      // broadcaster is actively streaming
  | 'ended';    // stream finished or manually stopped

export interface Broadcast {
  /** Unique broadcast identifier (UUID). */
  id: string;

  /** Human-readable title for this broadcast. */
  title: string;

  /** userId of the broadcaster. */
  hostUserId: string;

  /**
   * Secret key used in the RTMP push URL.
   * Treat like a password — never expose in list endpoints.
   */
  streamKey: string;

  /** Current lifecycle state. */
  state: BroadcastState;

  /** ISO-8601 timestamp of creation. */
  createdAt: string;

  /** ISO-8601 timestamp of the last state change. */
  updatedAt: string;

  /** ISO-8601 timestamp when state transitioned to 'live'. Null until then. */
  startedAt: string | null;

  /** ISO-8601 timestamp when state transitioned to 'ended'. Null until then. */
  endedAt: string | null;

  /** Approximate viewer count updated by the RTMP service. */
  viewerCount: number;
}

// ---------------------------------------------------------------------------
// REST request / response shapes
// ---------------------------------------------------------------------------

/** Body for POST /api/v1/streams */
export interface CreateBroadcastBody {
  title: string;
  hostUserId: string;
}

/** Broadcast DTO returned in list endpoints (omits the sensitive streamKey). */
export type BroadcastPublic = Omit<Broadcast, 'streamKey'>;

/** Broadcast DTO returned to the host (includes the streamKey). */
export type BroadcastHost = Broadcast & {
  /** Full RTMP push URL, ready to paste into OBS. */
  rtmpUrl: string;

  /** HLS playback URL for viewers. */
  hlsUrl: string;
};

// ---------------------------------------------------------------------------
// Socket.IO streaming events
// ---------------------------------------------------------------------------

export interface StreamingStartedPayload {
  broadcastId: string;
  streamKey: string;
  hostUserId: string;
}

export interface StreamingEndedPayload {
  broadcastId: string;
  streamKey: string;
  hostUserId: string;
}

export interface ViewerCountPayload {
  broadcastId: string;
  viewerCount: number;
}
