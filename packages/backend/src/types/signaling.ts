/**
 * Backend-local WebRTC / Signaling type definitions.
 *
 * These mirror the shapes in @helpingyou/shared but are kept local to avoid
 * a hard build-time dependency on the shared package during signaling-server
 * startup.
 */

export type CallType = 'audio' | 'video';

export type SessionState =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'ended'
  | 'failed';

export interface Session {
  id: string;
  callType: CallType;
  state: SessionState;
  createdBy: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// ---------------------------------------------------------------------------
// Socket.IO signaling payloads
// ---------------------------------------------------------------------------

export interface SignalingJoinPayload {
  sessionId: string;
  userId: string;
}

export interface SignalingLeavePayload {
  sessionId: string;
  userId: string;
}

export interface SignalingOfferPayload {
  sessionId: string;
  fromUserId: string;
  sdp: { type: string; sdp?: string };
}

export interface SignalingAnswerPayload {
  sessionId: string;
  fromUserId: string;
  sdp: { type: string; sdp?: string };
}

export interface SignalingIceCandidatePayload {
  sessionId: string;
  fromUserId: string;
  candidate: {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
  };
}
