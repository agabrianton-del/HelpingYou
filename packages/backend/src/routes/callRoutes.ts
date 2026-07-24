import { Router } from 'express';
import { createSession, getSession, endSession } from '../controllers/callController';

const router = Router();

/**
 * POST /api/v1/calls/sessions
 * Create a new call session and receive ICE server configuration.
 *
 * Body: { callType: 'audio' | 'video', userId: string }
 */
router.post('/sessions', createSession);

/**
 * GET /api/v1/calls/sessions/:id
 * Retrieve an existing session plus ICE server configuration.
 */
router.get('/sessions/:id', getSession);

/**
 * DELETE /api/v1/calls/sessions/:id
 * End / close a session.
 */
router.delete('/sessions/:id', endSession);

export default router;
