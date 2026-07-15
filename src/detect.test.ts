import { isExpress, isFastify, isHono } from './detect.js';

describe('isExpress', () => {
  it('should return true for a valid Express request/response pair', () => {
    const req: any = {
      app: {},
      headers: {},
    };
    const res: any = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    expect(isExpress(req, res)).toBe(true);
  });

  it('should return false when req is not an object', () => {
    const res: any = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    expect(isExpress(null, res)).toBe(false);
    expect(isExpress(undefined, res)).toBe(false);
    expect(isExpress('string', res)).toBe(false);
  });

  it('should return false when res is not an object', () => {
    const req: any = {
      app: {},
      headers: {},
    };

    expect(isExpress(req, null)).toBe(false);
    expect(isExpress(req, undefined)).toBe(false);
    expect(isExpress(req, 'string')).toBe(false);
  });

  it('should return false when req.app is undefined', () => {
    const req: any = {
      headers: {},
    };
    const res: any = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    expect(isExpress(req, res)).toBe(false);
  });

  it('should return false when req.headers is undefined', () => {
    const req: any = {
      app: {},
    };
    const res: any = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    expect(isExpress(req, res)).toBe(false);
  });

  it('should return false when res.setHeader is not a function', () => {
    const req: any = {
      app: {},
      headers: {},
    };
    const res: any = {
      setHeader: 'not a function',
      send: jest.fn(),
    };

    expect(isExpress(req, res)).toBe(false);
  });

  it('should return false when res.send is not a function', () => {
    const req: any = {
      app: {},
      headers: {},
    };
    const res: any = {
      setHeader: jest.fn(),
      send: 'not a function',
    };

    expect(isExpress(req, res)).toBe(false);
  });

  it('should return false for a Fastify-like request', () => {
    const req: any = {
      server: {},
      raw: {},
      id: 1,
    };
    const res: any = {};

    expect(isExpress(req, res)).toBe(false);
  });

  it('should return false for a Hono-like context', () => {
    const req: any = {
      header: jest.fn(),
      res: {},
    };
    const res: any = {};

    expect(isExpress(req, res)).toBe(false);
  });
});

describe('isFastify', () => {
  it('should return true for a valid Fastify request', () => {
    const req: any = {
      server: {},
      raw: {},
      id: 'req-1',
    };

    expect(isFastify(req)).toBe(true);
  });

  it('should return false when req is not an object', () => {
    expect(isFastify(null)).toBe(false);
    expect(isFastify(undefined)).toBe(false);
    expect(isFastify('string')).toBe(false);
  });

  it('should return false when req.server is missing', () => {
    const req: any = {
      raw: {},
      id: 'req-1',
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false when req.server is not an object', () => {
    const req: any = {
      server: 'not an object',
      raw: {},
      id: 'req-1',
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false when req.raw is not an object', () => {
    const req: any = {
      server: {},
      raw: 'not an object',
      id: 'req-1',
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false when req.raw is undefined', () => {
    const req: any = {
      server: {},
      id: 'req-1',
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false when req.id is undefined', () => {
    const req: any = {
      server: {},
      raw: {},
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false for an Express-like request', () => {
    const req: any = {
      app: {},
      headers: {},
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false for a Hono-like context', () => {
    const req: any = {
      header: jest.fn(),
      res: {},
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should handle falsy req.server values like 0 or empty string', () => {
    const req1: any = { server: 0, raw: {}, id: 1 };
    const req2: any = { server: '', raw: {}, id: 1 };

    expect(isFastify(req1)).toBe(false);
    expect(isFastify(req2)).toBe(false);
  });
});

describe('isHono', () => {
  it('should return true for a valid Hono context', () => {
    const req: any = {
      header: jest.fn(),
      res: {},
    };

    expect(isHono(req)).toBe(true);
  });

  it('should return false when req is not an object', () => {
    expect(isHono(null)).toBe(false);
    expect(isHono(undefined)).toBe(false);
    expect(isHono('string')).toBe(false);
  });

  it('should return false when req.header is not a function', () => {
    const req: any = {
      header: 'not a function',
      res: {},
    };

    expect(isHono(req)).toBe(false);
  });

  it('should return false when req.header is missing', () => {
    const req: any = {
      res: {},
    };

    expect(isHono(req)).toBe(false);
  });

  it('should return false when req.res is undefined', () => {
    const req: any = {
      header: jest.fn(),
    };

    expect(isHono(req)).toBe(false);
  });

  it('should return true when req.res is null (defined but null)', () => {
    const req: any = {
      header: jest.fn(),
      res: null,
    };

    expect(isHono(req)).toBe(true);
  });

  it('should return false for an Express-like request', () => {
    const req: any = {
      app: {},
      headers: {},
    };

    expect(isHono(req)).toBe(false);
  });

  it('should return false for a Fastify-like request', () => {
    const req: any = {
      server: {},
      raw: {},
      id: 1,
    };

    expect(isHono(req)).toBe(false);
  });
});