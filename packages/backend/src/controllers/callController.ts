import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import type { Session, CallType, IceServerConfig } from '../types/signaling';

/**
 * In-memory session store (MVP).
 *
 * Replace with Redis or a database for production use.
 * The Map is exported so that the signaling service can read/write session
 * state without an additional HTTP round-trip.
 */
export const sessions = new Map<string, Session>();

/**
 * Returns the ICE server list to be forwarded to WebRTC clients.
 *
 * Reads STUN/TURN configuration from environment variables so that
 * credentials are never hard-coded in the source tree.
 *
 * Expected env vars (all optional — public Google STUN used as fallback):
 *   STUN_URL          e.g. stun:stun.helpingyou.org:3478
 *   TURN_URL          e.g. turn:turn.helpingyou.org:3478
 *   TURN_USERNAME
 *   TURN_CREDENTIAL
 */
function getIceServers(): IceServerConfig[] {
  const servers: IceServerConfig[] = [
    { urls: process.env.STUN_URL ?? 'stun:stun.l.google.com:19302' },
    { urls: process.env.STUN_URL_2 ?? 'stun:stun1.l.google.com:19302' },
  ];

  if (process.env.TURN_URL) {
    servers.push({
      urls: process.env.TURN_URL,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    });
  }

  return servers;
}

// ---------------------------------------------------------------------------
// POST /api/v1/calls/sessions
// ---------------------------------------------------------------------------

export const createSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { callType, userId } = req.body as { callType?: string; userId?: string };

    if (!callType || !['audio', 'video'].includes(callType)) {
      return next(new ApiError(400, 'callType must be "audio" or "video"', 'INVALID_CALL_TYPE'));
    }

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return next(new ApiError(400, 'userId is required', 'INVALID_USER_ID'));
    }

    const now = new Date().toISOString();
    const session: Session = {
      id: uuidv4(),
      callType: callType as CallType,
      state: 'waiting',
      createdBy: userId.trim(),
      participants: [userId.trim()],
      createdAt: now,
      updatedAt: now,
    };

    sessions.set(session.id, session);

    logger.info(`Session created: ${session.id} by ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        session,
        iceServers: getIceServers(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/calls/sessions/:id
// ---------------------------------------------------------------------------

export const getSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = req.params['id'];
    if (!id) {
      return next(new ApiError(400, 'Missing session id', 'MISSING_ID'));
    }
    const session = sessions.get(id);

    if (!session) {
      return next(new ApiError(404, 'Session not found', 'SESSION_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      data: {
        session,
        iceServers: getIceServers(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/v1/calls/sessions/:id
// ---------------------------------------------------------------------------

export const endSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = req.params['id'];
    if (!id) {
      return next(new ApiError(400, 'Missing session id', 'MISSING_ID'));
    }
    const session = sessions.get(id);

    if (!session) {
      return next(new ApiError(404, 'Session not found', 'SESSION_NOT_FOUND'));
    }

    const now = new Date().toISOString();
    const updated: Session = { ...session, state: 'ended', updatedAt: now };
    sessions.set(id, updated);

    logger.info(`Session ended: ${id}`);

    res.status(200).json({
      success: true,
      data: { session: updated },
    });
  } catch (error) {
    next(error);
  }
};
