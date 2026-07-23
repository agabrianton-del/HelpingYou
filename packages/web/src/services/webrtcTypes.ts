/**
 * WebRTC type definitions for the web package.
 *
 * Mirrors the shapes in @helpingyou/shared/types/webrtc without a hard
 * build-time dependency on the compiled shared package.
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

export interface IWebRTCProvider {
  initialise(config: WebRTCProviderConfig): Promise<void>;
  createOffer(): Promise<void>;
  handleOffer(sdp: RTCSessionDescriptionInit): Promise<void>;
  handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  setAudioEnabled(enabled: boolean): void;
  setVideoEnabled(enabled: boolean): void;
  hangUp(): void;
  readonly localStream: MediaStream | null;
  readonly remoteStream: MediaStream | null;
}

export interface WebRTCProviderConfig {
  callType: CallType;
  iceServers: IceServerConfig[];
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
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
