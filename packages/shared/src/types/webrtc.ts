/**
 * Shared WebRTC types for HelpingYou
 *
 * These types are used by both the backend (signaling server) and
 * frontend clients (web, mobile) to ensure a consistent contract
 * across the entire platform.
 *
 * Architecture notes:
 *  - Peer-to-peer for 1-to-1 sessions (MVP)
 *  - IWebRTCProvider interface enables future SFU integration
 *    (LiveKit, mediasoup, Janus) without breaking changes
 */

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export type SessionState =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'ended'
  | 'failed';

export type CallType = 'audio' | 'video';

export interface Session {
  id: string;
  callType: CallType;
  state: SessionState;
  createdBy: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// ICE / STUN / TURN
// ---------------------------------------------------------------------------

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// ---------------------------------------------------------------------------
// Signaling messages  (client → server and server → client)
// ---------------------------------------------------------------------------

export type SignalingEventType =
  | 'signaling:join'
  | 'signaling:leave'
  | 'signaling:offer'
  | 'signaling:answer'
  | 'signaling:ice-candidate'
  | 'signaling:peer-joined'
  | 'signaling:peer-left'
  | 'signaling:error';

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
  sdp: RTCSessionDescriptionInit;
}

export interface SignalingAnswerPayload {
  sessionId: string;
  fromUserId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface SignalingIceCandidatePayload {
  sessionId: string;
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface SignalingPeerJoinedPayload {
  sessionId: string;
  userId: string;
}

export interface SignalingPeerLeftPayload {
  sessionId: string;
  userId: string;
}

export interface SignalingErrorPayload {
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// SFU-extensibility — abstract provider interface
//
// The P2P implementation fulfils this contract.  Future SFU providers
// (LiveKit, mediasoup, Janus) must implement the same interface so that
// callers can swap providers without changing their code.
// ---------------------------------------------------------------------------

export interface IWebRTCProvider {
  /** Set up local media tracks and initialize the peer connection. */
  initialize(config: WebRTCProviderConfig): Promise<void>;

  /** Create an SDP offer and send it via the signaling channel. */
  createOffer(): Promise<void>;

  /** Process an incoming SDP offer and reply with an answer. */
  handleOffer(sdp: RTCSessionDescriptionInit): Promise<void>;

  /** Process an incoming SDP answer. */
  handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void>;

  /** Add a remote ICE candidate. */
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;

  /** Mute / unmute the local audio track. */
  setAudioEnabled(enabled: boolean): void;

  /** Enable / disable the local video track. */
  setVideoEnabled(enabled: boolean): void;

  /** Hang up – close all tracks and the peer connection. */
  hangUp(): void;

  /** The local media stream (camera + microphone). */
  readonly localStream: MediaStream | null;

  /** The remote media stream received from the peer. */
  readonly remoteStream: MediaStream | null;
}

export interface WebRTCProviderConfig {
  callType: CallType;
  iceServers: IceServerConfig[];
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
}

// ---------------------------------------------------------------------------
// REST API shapes
// ---------------------------------------------------------------------------

export interface CreateSessionRequest {
  callType: CallType;
  userId: string;
}

export interface CreateSessionResponse {
  session: Session;
  iceServers: IceServerConfig[];
}

export interface GetSessionResponse {
  session: Session;
  iceServers: IceServerConfig[];
}
