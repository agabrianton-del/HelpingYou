import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import type {
  SignalingJoinPayload,
  SignalingLeavePayload,
  SignalingOfferPayload,
  SignalingAnswerPayload,
  SignalingIceCandidatePayload,
} from '../types/signaling';

/**
 * SignalingService manages WebRTC session negotiation via Socket.IO.
 *
 * Each session is modelled as a Socket.IO room.  A maximum of two peers
 * may occupy the same room at once (1-to-1 MVP).  When a second peer
 * joins the room, the first peer is notified so that it can initiate the
 * WebRTC offer/answer exchange.
 *
 * Scaling note: this in-process room map works for a single server node.
 * To scale horizontally, replace it with Redis Adapter
 * (`@socket.io/redis-adapter`) without any changes to the event protocol.
 */
export class SignalingService {
  /** socketId → userId */
  private socketUserMap = new Map<string, string>();

  /** sessionId → Set<socketId> */
  private sessionRooms = new Map<string, Set<string>>();

  private readonly MAX_PEERS_PER_SESSION = 2;

  constructor(private readonly io: SocketIOServer) {}

  public registerHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Signaling: client connected [${socket.id}]`);

      socket.on('signaling:join', (payload: SignalingJoinPayload) =>
        this.handleJoin(socket, payload)
      );

      socket.on('signaling:leave', (payload: SignalingLeavePayload) =>
        this.handleLeave(socket, payload)
      );

      socket.on('signaling:offer', (payload: SignalingOfferPayload) =>
        this.handleOffer(socket, payload)
      );

      socket.on('signaling:answer', (payload: SignalingAnswerPayload) =>
        this.handleAnswer(socket, payload)
      );

      socket.on('signaling:ice-candidate', (payload: SignalingIceCandidatePayload) =>
        this.handleIceCandidate(socket, payload)
      );

      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------

  private handleJoin(socket: Socket, payload: SignalingJoinPayload): void {
    const { sessionId, userId } = payload;

    if (!sessionId || !userId) {
      socket.emit('signaling:error', { code: 'INVALID_PAYLOAD', message: 'sessionId and userId are required' });
      return;
    }

    const peers = this.sessionRooms.get(sessionId) ?? new Set<string>();

    if (peers.size >= this.MAX_PEERS_PER_SESSION) {
      socket.emit('signaling:error', { code: 'SESSION_FULL', message: 'Session already has the maximum number of peers' });
      return;
    }

    peers.add(socket.id);
    this.sessionRooms.set(sessionId, peers);
    this.socketUserMap.set(socket.id, userId);

    socket.join(sessionId);

    logger.info(`Signaling: ${userId} joined session ${sessionId}`);

    // Notify all OTHER peers in the room that a new participant arrived
    socket.to(sessionId).emit('signaling:peer-joined', { sessionId, userId });
  }

  private handleLeave(socket: Socket, payload: SignalingLeavePayload): void {
    const { sessionId, userId } = payload;
    this.removePeerFromSession(socket, sessionId, userId);
  }

  private handleOffer(socket: Socket, payload: SignalingOfferPayload): void {
    const { sessionId, sdp, fromUserId } = payload;

    if (!sessionId || !sdp || !fromUserId) {
      socket.emit('signaling:error', { code: 'INVALID_PAYLOAD', message: 'sessionId, sdp, and fromUserId are required' });
      return;
    }

    logger.info(`Signaling: offer from ${fromUserId} in session ${sessionId}`);
    socket.to(sessionId).emit('signaling:offer', payload);
  }

  private handleAnswer(socket: Socket, payload: SignalingAnswerPayload): void {
    const { sessionId, sdp, fromUserId } = payload;

    if (!sessionId || !sdp || !fromUserId) {
      socket.emit('signaling:error', { code: 'INVALID_PAYLOAD', message: 'sessionId, sdp, and fromUserId are required' });
      return;
    }

    logger.info(`Signaling: answer from ${fromUserId} in session ${sessionId}`);
    socket.to(sessionId).emit('signaling:answer', payload);
  }

  private handleIceCandidate(socket: Socket, payload: SignalingIceCandidatePayload): void {
    const { sessionId, candidate, fromUserId } = payload;

    if (!sessionId || !candidate || !fromUserId) {
      socket.emit('signaling:error', { code: 'INVALID_PAYLOAD', message: 'sessionId, candidate, and fromUserId are required' });
      return;
    }

    socket.to(sessionId).emit('signaling:ice-candidate', payload);
  }

  private handleDisconnect(socket: Socket): void {
    const userId = this.socketUserMap.get(socket.id);
    logger.info(`Signaling: client disconnected [${socket.id}] userId=${userId ?? 'unknown'}`);

    // Clean up all sessions this socket was part of
    this.sessionRooms.forEach((peers, sessionId) => {
      if (peers.has(socket.id)) {
        this.removePeerFromSession(socket, sessionId, userId ?? socket.id);
      }
    });

    this.socketUserMap.delete(socket.id);
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private removePeerFromSession(socket: Socket, sessionId: string, userId: string): void {
    const peers = this.sessionRooms.get(sessionId);
    if (!peers) return;

    peers.delete(socket.id);
    socket.leave(sessionId);

    logger.info(`Signaling: ${userId} left session ${sessionId}`);

    // Notify remaining peers
    socket.to(sessionId).emit('signaling:peer-left', { sessionId, userId });

    if (peers.size === 0) {
      this.sessionRooms.delete(sessionId);
      logger.info(`Signaling: session ${sessionId} closed (no peers remaining)`);
    }
  }
}
