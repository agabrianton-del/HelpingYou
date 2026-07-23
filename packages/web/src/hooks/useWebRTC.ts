import { useState, useCallback, useRef, useEffect } from 'react';
import { WebRTCService } from '../services/webrtcService';
import type { IceServerConfig, CallType, SessionState } from '../services/webrtcTypes';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export interface UseWebRTCOptions {
  callType?: CallType;
}

export interface UseWebRTCReturn {
  /** Current WebRTC / session lifecycle state. */
  sessionState: SessionState;
  /** RTCPeerConnection connection state. */
  connectionState: RTCPeerConnectionState | null;
  /** The active session id (set after createSession). */
  sessionId: string | null;
  /** The local camera/microphone stream. */
  localStream: MediaStream | null;
  /** The remote peer stream. */
  remoteStream: MediaStream | null;
  /** Whether local audio is currently muted. */
  isAudioEnabled: boolean;
  /** Whether local video is currently enabled. */
  isVideoEnabled: boolean;
  /** Create a new session and wait for a peer. */
  createSession: (userId: string) => Promise<void>;
  /** Join an existing session created by another user. */
  joinSession: (sessionId: string, userId: string) => Promise<void>;
  /** Leave the current session and clean up all resources. */
  leaveSession: () => Promise<void>;
  /** Toggle local audio mute. */
  toggleAudio: () => void;
  /** Toggle local video. */
  toggleVideo: () => void;
  /** Non-fatal error string, if any. */
  error: string | null;
}

/**
 * useWebRTC — React hook for peer-to-peer audio/video calls.
 *
 * Wraps WebRTCService with React state so components only need to
 * destructure streams and call the returned action functions.
 *
 * Session flow:
 *   Caller:  createSession(userId) → waits for peer → call proceeds
 *   Callee:  joinSession(sessionId, userId) → sends offer → call proceeds
 */
export function useWebRTC({ callType = 'video' }: UseWebRTCOptions = {}): UseWebRTCReturn {
  const serviceRef = useRef<WebRTCService>(new WebRTCService());

  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [error, setError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const iceServersRef = useRef<IceServerConfig[]>([]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const svc = serviceRef.current;
      if (sessionId && userIdRef.current) {
        svc.disconnectSignaling(sessionId, userIdRef.current);
      }
      svc.hangUp();
    };
  }, [sessionId]);

  // -------------------------------------------------------------------------
  // initialize the WebRTC peer connection
  // -------------------------------------------------------------------------
  const initializePeerConnection = useCallback(
    async (iceServers: IceServerConfig[]) => {
      const svc = serviceRef.current;
      await svc.initialize({
        callType,
        iceServers,
        onIceCandidate: (candidate) => {
          if (sessionId && userIdRef.current) {
            svc.sendIceCandidate(sessionId, userIdRef.current, candidate);
          }
        },
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
          setSessionState('connected');
        },
        onConnectionStateChange: (state) => {
          setConnectionState(state);
          if (state === 'failed' || state === 'disconnected') {
            setSessionState('failed');
          }
        },
      });
      setLocalStream(svc.localStream);
    },
    [callType, sessionId]
  );

  // -------------------------------------------------------------------------
  // createSession — caller side
  // -------------------------------------------------------------------------
  const createSession = useCallback(
    async (userId: string) => {
      setError(null);
      setSessionState('creating');
      userIdRef.current = userId;

      try {
        const res = await fetch(`${API_BASE}/calls/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callType, userId }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message ?? 'Failed to create session');
        }

        const { data } = await res.json();
        const newSessionId: string = data.session.id;
        iceServersRef.current = data.iceServers as IceServerConfig[];

        setSessionId(newSessionId);
        setSessionState('waiting');

        await initializePeerConnection(iceServersRef.current);

        const svc = serviceRef.current;
        svc.connectSignaling(newSessionId, userId, {
          onPeerJoined: async () => {
            setSessionState('connecting');
            await svc.createOffer();
            svc.sendOffer(newSessionId, userId);
          },
          onPeerLeft: () => setSessionState('ended'),
          onError: ({ message }) => setError(message),
        });
      } catch (err) {
        setSessionState('failed');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [callType, initializePeerConnection]
  );

  // -------------------------------------------------------------------------
  // joinSession — callee side
  // -------------------------------------------------------------------------
  const joinSession = useCallback(
    async (targetSessionId: string, userId: string) => {
      setError(null);
      setSessionState('creating');
      userIdRef.current = userId;

      try {
        const res = await fetch(`${API_BASE}/calls/sessions/${targetSessionId}`);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message ?? 'Session not found');
        }

        const { data } = await res.json();
        iceServersRef.current = data.iceServers as IceServerConfig[];

        setSessionId(targetSessionId);
        setSessionState('connecting');

        await initializePeerConnection(iceServersRef.current);

        const svc = serviceRef.current;
        svc.connectSignaling(targetSessionId, userId, {
          onPeerJoined: () => {
            // Already in session — peer re-connected
          },
          onPeerLeft: () => setSessionState('ended'),
          onError: ({ message }) => setError(message),
        });
      } catch (err) {
        setSessionState('failed');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [initializePeerConnection]
  );

  // -------------------------------------------------------------------------
  // leaveSession
  // -------------------------------------------------------------------------
  const leaveSession = useCallback(async () => {
    if (!sessionId || !userIdRef.current) return;

    setSessionState('disconnecting');
    const svc = serviceRef.current;

    svc.disconnectSignaling(sessionId, userIdRef.current);
    svc.hangUp();

    await fetch(`${API_BASE}/calls/sessions/${sessionId}`, { method: 'DELETE' }).catch(() => {
      // Best-effort — don't throw if the server is unreachable
    });

    setSessionId(null);
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState(null);
    setSessionState('ended');
  }, [sessionId]);

  // -------------------------------------------------------------------------
  // Audio / video toggles
  // -------------------------------------------------------------------------
  const toggleAudio = useCallback(() => {
    const next = !isAudioEnabled;
    serviceRef.current.setAudioEnabled(next);
    setIsAudioEnabled(next);
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    const next = !isVideoEnabled;
    serviceRef.current.setVideoEnabled(next);
    setIsVideoEnabled(next);
  }, [isVideoEnabled]);

  return {
    sessionState,
    connectionState,
    sessionId,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    createSession,
    joinSession,
    leaveSession,
    toggleAudio,
    toggleVideo,
    error,
  };
}
