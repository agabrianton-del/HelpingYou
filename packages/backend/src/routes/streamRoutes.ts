import { Router } from 'express';
import type { RtmpService } from '../services/rtmpService';
import { createStreamController } from '../controllers/streamController';

/**
 * Builds and returns the stream router, injecting the shared RtmpService.
 *
 * Mounted at: /api/v1/streams
 *
 * Routes:
 *   POST   /api/v1/streams          — create a new broadcast room
 *   GET    /api/v1/streams          — list broadcasts (filter: ?state=live|created|ended)
 *   GET    /api/v1/streams/:id      — get a single broadcast (no streamKey)
 *   DELETE /api/v1/streams/:id      — end a broadcast
 */
export function createStreamRouter(rtmpService: RtmpService): Router {
  const router = Router();
  const { createBroadcast, listBroadcasts, getBroadcast, endBroadcast } =
    createStreamController(rtmpService);

  /**
   * POST /api/v1/streams
   * Create a broadcast room. Returns the streamKey and RTMP/HLS URLs.
   * Body: { title: string, hostUserId: string }
   */
  router.post('/', createBroadcast);

  /**
   * GET /api/v1/streams
   * List all broadcasts. Optionally filter by state: ?state=live|created|ended
   */
  router.get('/', listBroadcasts);

  /**
   * GET /api/v1/streams/:id
   * Get a single broadcast by ID (streamKey is omitted).
   */
  router.get('/:id', getBroadcast);

  /**
   * DELETE /api/v1/streams/:id
   * End a broadcast. Triggers the streaming:ended Socket.IO event.
   */
  router.delete('/:id', endBroadcast);

  return router;
}
