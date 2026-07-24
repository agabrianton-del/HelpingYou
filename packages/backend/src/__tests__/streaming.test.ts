/**
 * Unit tests for the RTMP streaming feature.
 *
 * node-media-server is mocked so that tests run without binding real network
 * ports. Socket.IO is also mocked to verify event emissions without a live
 * WebSocket server.
 */

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that trigger module evaluation
// ---------------------------------------------------------------------------

jest.mock('node-media-server', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    run: jest.fn(),
  }));
});

// ---------------------------------------------------------------------------
// Imports (after mocks are set up)
// ---------------------------------------------------------------------------

import NodeMediaServer from 'node-media-server';
import { RtmpService } from '../services/rtmpService';
import { createStreamController } from '../controllers/streamController';
import { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockIo() {
  const mockTo = jest.fn().mockReturnThis();
  const mockEmit = jest.fn();
  return {
    to: mockTo,
    emit: mockEmit,
  } as unknown as import('socket.io').Server;
}

function makeMockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    ...overrides,
  } as Request;
}

/** Returns the mock NodeMediaServer instance created during service.start(). */
function getNmsInstance() {
  const MockNMS = NodeMediaServer as jest.MockedClass<typeof NodeMediaServer>;
  return MockNMS.mock.results[0]?.value as { on: jest.Mock; run: jest.Mock };
}

/** Returns the callback registered for a specific NMS event name. */
function getNmsHandler(nmsInstance: { on: jest.Mock }, event: string) {
  const call = nmsInstance.on.mock.calls.find((c: unknown[]) => c[0] === event);
  return call?.[1] as (session: any) => void;
}

// ---------------------------------------------------------------------------
// RtmpService tests
// ---------------------------------------------------------------------------

describe('RtmpService', () => {
  let service: RtmpService;
  let io: ReturnType<typeof makeMockIo>;

  beforeEach(() => {
    jest.clearAllMocks();
    io = makeMockIo();
    service = new RtmpService(io as any);
  });

  describe('start()', () => {
    it('creates a NodeMediaServer with the expected config and calls run()', () => {
      service.start();
      const nms = getNmsInstance();
      expect(nms.run).toHaveBeenCalledTimes(1);
    });

    it('registers all required NMS event handlers', () => {
      service.start();
      const nms = getNmsInstance();
      const registeredEvents = nms.on.mock.calls.map((c: unknown[]) => c[0]);
      expect(registeredEvents).toContain('prePublish');
      expect(registeredEvents).toContain('postPublish');
      expect(registeredEvents).toContain('donePublish');
      expect(registeredEvents).toContain('postPlay');
      expect(registeredEvents).toContain('donePlay');
    });
  });

  describe('createBroadcast()', () => {
    it('returns a broadcast with state=created and a non-empty streamKey', () => {
      const b = service.createBroadcast('Test Stream', 'user-1');
      expect(b.state).toBe('created');
      expect(b.streamKey).toBeTruthy();
      expect(b.title).toBe('Test Stream');
      expect(b.hostUserId).toBe('user-1');
      expect(b.startedAt).toBeNull();
      expect(b.endedAt).toBeNull();
      expect(b.viewerCount).toBe(0);
    });

    it('stores the broadcast in the internal map', () => {
      const b = service.createBroadcast('Stream', 'user-2');
      expect(service.getBroadcast(b.id)).toEqual(b);
    });

    it('trims whitespace from the title', () => {
      const b = service.createBroadcast('  My Stream  ', 'user-3');
      expect(b.title).toBe('My Stream');
    });
  });

  describe('listBroadcasts()', () => {
    it('returns all broadcasts when no filter is given', () => {
      service.createBroadcast('A', 'u1');
      service.createBroadcast('B', 'u2');
      expect(service.listBroadcasts()).toHaveLength(2);
    });

    it('filters by state', () => {
      const b = service.createBroadcast('A', 'u1');
      service.createBroadcast('B', 'u2');
      service.endBroadcast(b.id);
      const remaining = service.listBroadcasts('created');
      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.title).toBe('B');
    });
  });

  describe('endBroadcast()', () => {
    it('transitions state to ended and sets endedAt', () => {
      const b = service.createBroadcast('Stream', 'u1');
      const ended = service.endBroadcast(b.id);
      expect(ended?.state).toBe('ended');
      expect(ended?.endedAt).toBeTruthy();
    });

    it('returns undefined for an unknown id', () => {
      expect(service.endBroadcast('does-not-exist')).toBeUndefined();
    });

    it('is idempotent — calling twice does not change endedAt', () => {
      const b = service.createBroadcast('Stream', 'u1');
      const first = service.endBroadcast(b.id);
      const second = service.endBroadcast(b.id);
      expect(second?.endedAt).toBe(first?.endedAt);
    });

    it('emits streaming:ended via Socket.IO', () => {
      const b = service.createBroadcast('Stream', 'u1');
      service.endBroadcast(b.id);
      expect(io.to).toHaveBeenCalledWith(b.id);
      expect(io.emit).toHaveBeenCalledWith(
        'streaming:ended',
        expect.objectContaining({ broadcastId: b.id })
      );
    });
  });

  describe('buildRtmpUrl() / buildHlsUrl()', () => {
    it('embeds the streamKey in the URL', () => {
      const rtmp = service.buildRtmpUrl('my-key');
      expect(rtmp).toContain('my-key');
      expect(rtmp).toMatch(/^rtmp:/);

      const hls = service.buildHlsUrl('my-key');
      expect(hls).toContain('my-key');
      expect(hls).toMatch(/^http:/);
      expect(hls).toContain('index.m3u8');
    });
  });

  describe('NMS event callbacks', () => {
    let nms: { on: jest.Mock; run: jest.Mock };

    beforeEach(() => {
      service.start();
      nms = getNmsInstance();
    });

    it('prePublish rejects sessions with an unknown streamKey', () => {
      const rejectMock = jest.fn();
      const handler = getNmsHandler(nms, 'prePublish');
      handler({ streamPath: '/live/unknown-key', reject: rejectMock });
      expect(rejectMock).toHaveBeenCalled();
    });

    it('prePublish accepts a valid streamKey', () => {
      const b = service.createBroadcast('Stream', 'u1');
      const rejectMock = jest.fn();
      const handler = getNmsHandler(nms, 'prePublish');
      handler({ streamPath: `/live/${b.streamKey}`, reject: rejectMock });
      expect(rejectMock).not.toHaveBeenCalled();
    });

    it('postPublish transitions broadcast to live and emits streaming:started', () => {
      const b = service.createBroadcast('Stream', 'u1');
      const handler = getNmsHandler(nms, 'postPublish');
      handler({ streamPath: `/live/${b.streamKey}` });

      const updated = service.getBroadcast(b.id);
      expect(updated?.state).toBe('live');
      expect(updated?.startedAt).toBeTruthy();

      expect(io.emit).toHaveBeenCalledWith(
        'streaming:started',
        expect.objectContaining({ broadcastId: b.id })
      );
    });

    it('donePublish ends the broadcast', () => {
      const b = service.createBroadcast('Stream', 'u1');
      getNmsHandler(nms, 'postPublish')({ streamPath: `/live/${b.streamKey}` });
      getNmsHandler(nms, 'donePublish')({ streamPath: `/live/${b.streamKey}` });

      const updated = service.getBroadcast(b.id);
      expect(updated?.state).toBe('ended');
    });

    it('postPlay / donePlay update the viewer count', () => {
      const b = service.createBroadcast('Stream', 'u1');
      getNmsHandler(nms, 'postPublish')({ streamPath: `/live/${b.streamKey}` });

      getNmsHandler(nms, 'postPlay')({ streamPath: `/live/${b.streamKey}` });
      getNmsHandler(nms, 'postPlay')({ streamPath: `/live/${b.streamKey}` });
      expect(service.getBroadcast(b.id)?.viewerCount).toBe(2);

      getNmsHandler(nms, 'donePlay')({ streamPath: `/live/${b.streamKey}` });
      expect(service.getBroadcast(b.id)?.viewerCount).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// streamController tests
// ---------------------------------------------------------------------------

describe('streamController', () => {
  let service: RtmpService;
  let controller: ReturnType<typeof createStreamController>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RtmpService(makeMockIo() as any);
    controller = createStreamController(service);
    next = jest.fn() as unknown as NextFunction;
  });

  // -------------------------------------------------------------------------
  // POST /api/v1/streams
  // -------------------------------------------------------------------------

  describe('createBroadcast()', () => {
    it('returns 201 with host info including rtmpUrl and hlsUrl', () => {
      const req = makeReq({ body: { title: 'My Stream', hostUserId: 'u1' } });
      const res = makeMockRes();

      controller.createBroadcast(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      const json = (res.json as jest.Mock).mock.calls[0][0];
      expect(json.success).toBe(true);
      expect(json.data.rtmpUrl).toBeDefined();
      expect(json.data.hlsUrl).toBeDefined();
      expect(json.data.streamKey).toBeDefined();
    });

    it('calls next with 400 when title is missing', () => {
      const req = makeReq({ body: { hostUserId: 'u1' } });
      const res = makeMockRes();

      controller.createBroadcast(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, code: 'INVALID_TITLE' })
      );
    });

    it('calls next with 400 when hostUserId is missing', () => {
      const req = makeReq({ body: { title: 'Stream' } });
      const res = makeMockRes();

      controller.createBroadcast(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, code: 'INVALID_HOST_USER_ID' })
      );
    });
  });

  // -------------------------------------------------------------------------
  // GET /api/v1/streams
  // -------------------------------------------------------------------------

  describe('listBroadcasts()', () => {
    it('returns 200 with an array and omits streamKey', () => {
      service.createBroadcast('A', 'u1');
      const req = makeReq({ query: {} });
      const res = makeMockRes();

      controller.listBroadcasts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const json = (res.json as jest.Mock).mock.calls[0][0];
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data[0].streamKey).toBeUndefined();
    });

    it('filters by state query param', () => {
      const b = service.createBroadcast('A', 'u1');
      service.createBroadcast('B', 'u2');
      service.endBroadcast(b.id);

      const req = makeReq({ query: { state: 'ended' } });
      const res = makeMockRes();

      controller.listBroadcasts(req, res, next);

      const json = (res.json as jest.Mock).mock.calls[0][0];
      expect(json.data).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // GET /api/v1/streams/:id
  // -------------------------------------------------------------------------

  describe('getBroadcast()', () => {
    it('returns 200 and omits streamKey', () => {
      const b = service.createBroadcast('Stream', 'u1');
      const req = makeReq({ params: { id: b.id } });
      const res = makeMockRes();

      controller.getBroadcast(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const json = (res.json as jest.Mock).mock.calls[0][0];
      expect(json.data.streamKey).toBeUndefined();
    });

    it('returns 404 for unknown id', () => {
      const req = makeReq({ params: { id: 'not-found' } });
      const res = makeMockRes();

      controller.getBroadcast(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, code: 'BROADCAST_NOT_FOUND' })
      );
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /api/v1/streams/:id
  // -------------------------------------------------------------------------

  describe('endBroadcast()', () => {
    it('returns 200 with state=ended', () => {
      const b = service.createBroadcast('Stream', 'u1');
      const req = makeReq({ params: { id: b.id } });
      const res = makeMockRes();

      controller.endBroadcast(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const json = (res.json as jest.Mock).mock.calls[0][0];
      expect(json.data.state).toBe('ended');
      expect(json.data.streamKey).toBeUndefined();
    });

    it('returns 404 for unknown id', () => {
      const req = makeReq({ params: { id: 'ghost' } });
      const res = makeMockRes();

      controller.endBroadcast(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, code: 'BROADCAST_NOT_FOUND' })
      );
    });
  });
});

