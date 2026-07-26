import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import type { RtmpService } from '../services/rtmpService';
import type { BroadcastState, BroadcastHost, BroadcastPublic } from '../types/streaming';

// ---------------------------------------------------------------------------
// Factory — injects the shared RtmpService instance
// ---------------------------------------------------------------------------

/**
 * Returns Express route handlers bound to the provided RtmpService instance.
 *
 * Using a factory instead of module-level singletons keeps the controller
 * fully testable: tests can inject a mock/stub RtmpService.
 */
export function createStreamController(rtmpService: RtmpService) {
  // -------------------------------------------------------------------------
  // POST /api/v1/streams
  // -------------------------------------------------------------------------

  const createBroadcast = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { title, hostUserId } = req.body as { title?: string; hostUserId?: string };

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return next(new ApiError(400, 'title is required', 'INVALID_TITLE'));
      }

      if (!hostUserId || typeof hostUserId !== 'string' || hostUserId.trim().length === 0) {
        return next(new ApiError(400, 'hostUserId is required', 'INVALID_HOST_USER_ID'));
      }

      const broadcast = rtmpService.createBroadcast(title, hostUserId.trim());

      const response: BroadcastHost = {
        ...broadcast,
        rtmpUrl: rtmpService.buildRtmpUrl(broadcast.streamKey),
        hlsUrl: rtmpService.buildHlsUrl(broadcast.streamKey),
      };

      logger.info(`Stream controller: broadcast created id=${broadcast.id}`);

      res.status(201).json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  };

  // -------------------------------------------------------------------------
  // GET /api/v1/streams
  // -------------------------------------------------------------------------

  const listBroadcasts = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { state } = req.query;

      const validStates: BroadcastState[] = ['created', 'live', 'ended'];
      const stateFilter =
        typeof state === 'string' && validStates.includes(state as BroadcastState)
          ? (state as BroadcastState)
          : undefined;

      const broadcasts = rtmpService.listBroadcasts(stateFilter);

      // Strip the sensitive streamKey from list responses
      const publicList: BroadcastPublic[] = broadcasts.map(({ streamKey: _sk, ...rest }) => rest);

      res.status(200).json({
        success: true,
        data: publicList,
        total: publicList.length,
      });
    } catch (error) {
      next(error);
    }
  };

  // -------------------------------------------------------------------------
  // GET /api/v1/streams/:id
  // -------------------------------------------------------------------------

  const getBroadcast = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      if (!id) {
        return next(new ApiError(400, 'Missing broadcast id', 'MISSING_ID'));
      }

      const broadcast = rtmpService.getBroadcast(id);
      if (!broadcast) {
        return next(new ApiError(404, 'Broadcast not found', 'BROADCAST_NOT_FOUND'));
      }

      // Strip the streamKey from the public GET response.
      // The streamKey is only provided at creation time (POST).
      const { streamKey: _sk, ...publicBroadcast } = broadcast;

      res.status(200).json({ success: true, data: publicBroadcast });
    } catch (error) {
      next(error);
    }
  };

  // -------------------------------------------------------------------------
  // DELETE /api/v1/streams/:id
  // -------------------------------------------------------------------------

  const endBroadcast = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      if (!id) {
        return next(new ApiError(400, 'Missing broadcast id', 'MISSING_ID'));
      }

      const broadcast = rtmpService.getBroadcast(id);
      if (!broadcast) {
        return next(new ApiError(404, 'Broadcast not found', 'BROADCAST_NOT_FOUND'));
      }

      const updated = rtmpService.endBroadcast(id);

      logger.info(`Stream controller: broadcast ended id=${id}`);

      const { streamKey: _sk, ...publicBroadcast } = updated!;

      res.status(200).json({ success: true, data: publicBroadcast });
    } catch (error) {
      next(error);
    }
  };

  return { createBroadcast, listBroadcasts, getBroadcast, endBroadcast };
}
