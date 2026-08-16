const express = require('express');
const sseRouter = require('../stream/sse');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api' });
});

router.use('/stream', sseRouter);

module.exports = router;
