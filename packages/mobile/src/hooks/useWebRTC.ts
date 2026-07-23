import { useState, useCallback, useRef, useEffect } from 'react';
import { MobileWebRTCService } from '../services/webrtcService';
import type { IceServerConfig, CallType, SessionState } from '../services/webrtcTypes';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export interface UseWebRTCOptions {
  callType?: CallType;
}

export interface UseWebRTCReturn {
  sessionState: SessionState;
  connectionState: string | null;
  sessionId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  createSession: (userId: string) => Promise<void>;
  joinSession: (sessionId: string, userId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  error: string | null;
}

/**
 * useWebRTC — React Native hook for peer-to-peer audio/video calls.
 *
 * Mirrors the web package's hook API so that shared business logic
 * (e.g. a cross-platform call screen) can use the same interface on
 * both web and mobile.
 */
export function useWebRTC({ callType = 'video' }: UseWebRTCOptions = {}): UseWebRTCReturn {
  const serviceRef = useRef<MobileWebRTCService>(new MobileWebRTCService());

  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [connectionState, setConnectionState] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [error, setError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const iceServersRef = useRef<IceServerConfig[]>([]);

  useEffect(() => {
    return () => {
      const svc = serviceRef.current;
      if (sessionId && userIdRef.current) {
        svc.disconnectSignaling(sessionId, userIdRef.current);
      }
      svc.hangUp();
    };
  }, [sessionId]);

  const initialisePeerConnection = useCallback(
    async (iceServers: IceServerConfig[]) => {
      const svc = serviceRef.current;
      await svc.initialise({
        callType,
        iceServers,
        onIceCandidate: (candidate) => {
          if (sessionId && userIdRef.current) {
            svc.sendIceCandidate(sessionId, userIdRef.current, candidate);
          }
        },
        onRemoteStream: (stream) => {
          setRemoteStream(stream as unknown as MediaStream);
          setSessionState('connected');
        },
        onConnectionStateChange: (state) => {
          setConnectionState(state);
          if (state === 'failed' || state === 'disconnected') {
            setSessionState('failed');
          }
        },
      });
      setLocalStream(svc.localStream as unknown as MediaStream);
    },
    [callType, sessionId]
  );

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

        await initialisePeerConnection(iceServersRef.current);

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
    [callType, initialisePeerConnection]
  );

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

        await initialisePeerConnection(iceServersRef.current);

        const svc = serviceRef.current;
        svc.connectSignaling(targetSessionId, userId, {
          onPeerJoined: () => {},
          onPeerLeft: () => setSessionState('ended'),
          onError: ({ message }) => setError(message),
        });
      } catch (err) {
        setSessionState('failed');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [initialisePeerConnection]
  );

  const leaveSession = useCallback(async () => {
    if (!sessionId || !userIdRef.current) return;

    setSessionState('disconnecting');
    const svc = serviceRef.current;

    svc.disconnectSignaling(sessionId, userIdRef.current);
    svc.hangUp();

    await fetch(`${API_BASE}/calls/sessions/${sessionId}`, { method: 'DELETE' }).catch(() => {});

    setSessionId(null);
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState(null);
    setSessionState('ended');
  }, [sessionId]);

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
