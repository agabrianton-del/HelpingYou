const express = require('express');

const router = express.Router();

router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let counter = 0;

  const sendEvent = (type, data) => {
    if (type) res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent('connected', { message: 'SSE connection established' });

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  const ticker = setInterval(() => {
    counter += 1;
    sendEvent('tick', {
      count: counter,
      timestamp: new Date().toISOString()
    });
  }, 3000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(ticker);
    res.end();
  });
});

module.exports = router;
