import { io, Socket } from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import type {
  IWebRTCProvider,
  WebRTCProviderConfig,
  IceServerConfig,
  SignalingOfferPayload,
  SignalingAnswerPayload,
  SignalingIceCandidatePayload,
} from './webrtcTypes';

export type { IWebRTCProvider, WebRTCProviderConfig, IceServerConfig };

const SIGNALING_URL = process.env.EXPO_PUBLIC_SIGNALING_URL ?? 'http://localhost:3000';

/**
 * MobileWebRTCService — React Native WebRTC peer connection.
 *
 * Uses react-native-webrtc which provides an API compatible with the
 * browser WebRTC spec, enabling near-identical logic to WebRTCService
 * (web package) while targeting iOS and Android natively.
 *
 * Implements IWebRTCProvider so that future SFU integrations (LiveKit
 * React Native SDK, mediasoup, etc.) can be swapped in transparently.
 */
export class MobileWebRTCService implements IWebRTCProvider {
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

    // Acquire local media using react-native-webrtc's mediaDevices API
    this._localStream = (await mediaDevices.getUserMedia({
      audio: true,
      video: config.callType === 'video'
        ? { facingMode: 'user', frameRate: { ideal: 30 }, width: { ideal: 640 }, height: { ideal: 480 } }
        : false,
    })) as unknown as MediaStream;

    this.pc = new RTCPeerConnection({ iceServers: config.iceServers });

    // Add local tracks
    this._localStream.getTracks().forEach((track) => {
      this.pc!.addTrack(track, this._localStream!);
    });

    // Assemble remote stream
    this._remoteStream = new MediaStream([]);
    this.pc.ontrack = (event: { streams: MediaStream[] }) => {
      event.streams[0]?.getTracks().forEach((track: MediaStreamTrack) => {
        this._remoteStream!.addTrack(track);
      });
      config.onRemoteStream(this._remoteStream!);
    };

    // ICE candidates
    this.pc.onicecandidate = (event: { candidate: RTCIceCandidate | null }) => {
      if (event.candidate) {
        config.onIceCandidate({
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
      }
    };

    // Connection state
    this.pc.onconnectionstatechange = () => {
      if (this.pc) {
        config.onConnectionStateChange(this.pc.connectionState);
      }
    };
  }

  async createOffer(): Promise<void> {
    if (!this.pc) throw new Error('MobileWebRTCService not initialised');

    const offer = await this.pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: this.config?.callType === 'video',
    });
    await this.pc.setLocalDescription(new RTCSessionDescription(offer));
  }

  async handleOffer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('MobileWebRTCService not initialised');

    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(new RTCSessionDescription(answer));
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('MobileWebRTCService not initialised');

    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) throw new Error('MobileWebRTCService not initialised');

    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  setAudioEnabled(enabled: boolean): void {
    this._localStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = enabled;
    });
  }

  setVideoEnabled(enabled: boolean): void {
    this._localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = enabled;
    });
  }

  hangUp(): void {
    this._localStream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    this._localStream = null;
    this._remoteStream = null;
    this.pc?.close();
    this.pc = null;
  }

  // -------------------------------------------------------------------------
  // Signaling helpers
  // -------------------------------------------------------------------------

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

  sendOffer(sessionId: string, userId: string): void {
    const sdp = this.pc?.localDescription;
    if (!sdp || !this.socket) return;

    this.socket.emit('signaling:offer', { sessionId, fromUserId: userId, sdp });
  }

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

export const mobileWebRTCService = new MobileWebRTCService();
