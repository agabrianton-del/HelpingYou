import { io, Socket } from 'socket.io-client';
import type {
  IWebRTCProvider,
  WebRTCProviderConfig,
  IceServerConfig,
  SignalingOfferPayload,
  SignalingAnswerPayload,
  SignalingIceCandidatePayload,
} from './webrtcTypes';

export type { IWebRTCProvider, WebRTCProviderConfig, IceServerConfig };

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL ?? 'http://localhost:3000';

/**
 * WebRTCService — browser-native WebRTC peer connection.
 *
 * Uses the browser's built-in RTCPeerConnection and getUserMedia APIs.
 * Communicates with the HelpingYou signaling server via Socket.IO.
 *
 * Design:
 *  - Implements IWebRTCProvider so it can be swapped for an SFU-backed
 *    provider (LiveKit, mediasoup, Janus) without caller changes.
 *  - All media / ICE state flows through callbacks supplied at initialise().
 */
export class WebRTCService implements IWebRTCProvider {
  private pc: RTCPeerConnection | null = null;
  private socket: Socket | null = null;
  private config: WebRTCProviderConfig | null = null;

  private _localStream: MediaStream | null = null;
  private _remoteStream: MediaStream | null = null;

  get localStream(): MediaStream | null {
    return this._localStream;
  }

  get remoteStream(): MediaStream | null {
    return this._remoteStream;
  }

  // -------------------------------------------------------------------------
  // IWebRTCProvider
  // -------------------------------------------------------------------------

  async initialise(config: WebRTCProviderConfig): Promise<void> {
    this.config = config;

    // Acquire local media
    this._localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: config.callType === 'video',
    });

    // Create peer connection
    this.pc = new RTCPeerConnection({ iceServers: config.iceServers as RTCIceServer[] });

    // Add local tracks
    this._localStream.getTracks().forEach((track) => {
      this.pc!.addTrack(track, this._localStream!);
    });

    // Remote stream assembly
    this._remoteStream = new MediaStream();
    this.pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        this._remoteStream!.addTrack(track);
      });
      config.onRemoteStream(this._remoteStream!);
    };

    // ICE candidate handling
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        config.onIceCandidate(event.candidate.toJSON());
      }
    };

    // Connection state changes
    this.pc.onconnectionstatechange = () => {
      if (this.pc) {
        config.onConnectionStateChange(this.pc.connectionState);
      }
    };
  }

  async createOffer(): Promise<void> {
    if (!this.pc) throw new Error('WebRTCService not initialised');

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
  }

  async handleOffer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('WebRTCService not initialised');

    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('WebRTCService not initialised');

    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) throw new Error('WebRTCService not initialised');

    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  setAudioEnabled(enabled: boolean): void {
    this._localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  setVideoEnabled(enabled: boolean): void {
    this._localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  hangUp(): void {
    this._localStream?.getTracks().forEach((track) => track.stop());
    this._localStream = null;
    this._remoteStream = null;
    this.pc?.close();
    this.pc = null;
  }

  // -------------------------------------------------------------------------
  // Signaling helpers (used by the hook / caller)
  // -------------------------------------------------------------------------

  /**
   * Connect to the signaling server and register socket event handlers.
   *
   * @param sessionId  - The call session to join.
   * @param userId     - The local participant's user id.
   * @param handlers   - Callbacks for peer-lifecycle and SDP/ICE events.
   */
  connectSignaling(
    sessionId: string,
    userId: string,
    handlers: SignalingHandlers
  ): void {
    this.socket = io(SIGNALING_URL, { transports: ['websocket'] });

    this.socket.on('connect', () => {
      this.socket!.emit('signaling:join', { sessionId, userId });
    });

    this.socket.on('signaling:peer-joined', handlers.onPeerJoined);
    this.socket.on('signaling:peer-left', handlers.onPeerLeft);
    this.socket.on('signaling:error', handlers.onError);

    this.socket.on('signaling:offer', async (payload: SignalingOfferPayload) => {
      await this.handleOffer(payload.sdp as RTCSessionDescriptionInit);
      const answer = this.pc?.localDescription;
      if (answer) {
        this.socket!.emit('signaling:answer', {
          sessionId,
          fromUserId: userId,
          sdp: answer,
        });
      }
    });

    this.socket.on('signaling:answer', async (payload: SignalingAnswerPayload) => {
      await this.handleAnswer(payload.sdp as RTCSessionDescriptionInit);
    });

    this.socket.on('signaling:ice-candidate', async (payload: SignalingIceCandidatePayload) => {
      await this.addIceCandidate(payload.candidate as RTCIceCandidateInit);
    });
  }

  /**
   * Send an SDP offer through the signaling channel.
   * Call after createOffer() sets the local description.
   */
  sendOffer(sessionId: string, userId: string): void {
    const sdp = this.pc?.localDescription;
    if (!sdp || !this.socket) return;

    this.socket.emit('signaling:offer', { sessionId, fromUserId: userId, sdp });
  }

  /**
   * Send an ICE candidate through the signaling channel.
   */
  sendIceCandidate(
    sessionId: string,
    userId: string,
    candidate: RTCIceCandidateInit
  ): void {
    this.socket?.emit('signaling:ice-candidate', {
      sessionId,
      fromUserId: userId,
      candidate,
    });
  }

  /**
   * Notify the signaling server that the local peer is leaving and
   * close the socket connection.
   */
  disconnectSignaling(sessionId: string, userId: string): void {
    this.socket?.emit('signaling:leave', { sessionId, userId });
    this.socket?.disconnect();
    this.socket = null;
  }
}

// ---------------------------------------------------------------------------
// Supporting types
// ---------------------------------------------------------------------------

export interface SignalingHandlers {
  onPeerJoined: (payload: { sessionId: string; userId: string }) => void;
  onPeerLeft: (payload: { sessionId: string; userId: string }) => void;
  onError: (payload: { code: string; message: string }) => void;
}

export const webrtcService = new WebRTCService();
