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
    const req: any = 'not-an-object';
    const res: any = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    expect(isExpress(req, res)).toBe(false);
  });

  it('should return false when res is not an object', () => {
    const req: any = {
      app: {},
      headers: {},
    };
    const res: any = null;

    expect(isExpress(req, res)).toBe(false);
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
      setHeader: 'not-a-function',
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
      send: 'not-a-function',
    };

    expect(isExpress(req, res)).toBe(false);
  });

  it('should return false for a Fastify-like request', () => {
    const req: any = {
      server: {},
      raw: {},
      id: '123',
    };
    const res: any = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    expect(isExpress(req, res)).toBe(false);
  });

  it('should return false when both req and res are undefined', () => {
    expect(isExpress(undefined, undefined)).toBe(false);
  });
});

describe('isFastify', () => {
  it('should return true for a valid Fastify request', () => {
    const req: any = {
      server: {},
      raw: {},
      id: '123',
    };

    expect(isFastify(req)).toBe(true);
  });

  it('should return false when req is not an object', () => {
    expect(isFastify('not-an-object')).toBe(false);
  });

  it('should return false when req.server is undefined', () => {
    const req: any = {
      raw: {},
      id: '123',
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false when req.server is falsy', () => {
    const req: any = {
      server: null,
      raw: {},
      id: '123',
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false when req.server is not an object', () => {
    const req: any = {
      server: 'not-an-object',
      raw: {},
      id: '123',
    };

    expect(isFastify(req)).toBe(false);
  });

  it('should return false when req.raw is not an object', () => {
    const req: any = {
      server: {},
      raw: 'not-an-object',
      id: '123',
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

  it('should return false when req is undefined', () => {
    expect(isFastify(undefined)).toBe(false);
  });

  it('should return false when req is null', () => {
    expect(isFastify(null)).toBe(false);
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
    expect(isHono('not-an-object')).toBe(false);
  });

  it('should return false when req.header is not a function', () => {
    const req: any = {
      header: 'not-a-function',
      res: {},
    };

    expect(isHono(req)).toBe(false);
  });

  it('should return false when req.header is undefined', () => {
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

  it('should return true when req.res is null (defined but falsy)', () => {
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

  it('should return false when req is undefined', () => {
    expect(isHono(undefined)).toBe(false);
  });

  it('should return false when req is null', () => {
    expect(isHono(null)).toBe(false);
  });
});