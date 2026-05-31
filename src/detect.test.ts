import { isExpress, isFastify, isHono } from './detect.js';

describe('detect', () => {
  describe('isExpress', () => {
    it('should return true for valid Express request and response objects', () => {
      const req = {
        app: {},
        headers: {},
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      const req = null;
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false when res is not an object', () => {
      const req = {
        app: {},
        headers: {},
      };
      const res = null;

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false when req.app is undefined', () => {
      const req = {
        headers: {},
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false when req.headers is undefined', () => {
      const req = {
        app: {},
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false when res.setHeader is not a function', () => {
      const req = {
        app: {},
        headers: {},
      };
      const res = {
        setHeader: 'not a function',
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false when res.send is not a function', () => {
      const req = {
        app: {},
        headers: {},
      };
      const res = {
        setHeader: jest.fn(),
        send: 'not a function',
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false when both req and res are undefined', () => {
      expect(isExpress(undefined, undefined)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isExpress('string', 'string')).toBe(false);
      expect(isExpress(123, 456)).toBe(false);
      expect(isExpress(true, false)).toBe(false);
    });
  });

  describe('isFastify', () => {
    it('should return true for valid Fastify request object', () => {
      const req = {
        server: {},
        raw: {},
        id: 'request-id',
      };

      expect(isFastify(req)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isFastify(null)).toBe(false);
      expect(isFastify(undefined)).toBe(false);
    });

    it('should return false when req.server is undefined', () => {
      const req = {
        raw: {},
        id: 'request-id',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.server is not an object', () => {
      const req = {
        server: 'not an object',
        raw: {},
        id: 'request-id',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.raw is not an object', () => {
      const req = {
        server: {},
        raw: 'not an object',
        id: 'request-id',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.raw is undefined', () => {
      const req = {
        server: {},
        id: 'request-id',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.id is undefined', () => {
      const req = {
        server: {},
        raw: {},
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return true when req.id is 0 (falsy but defined)', () => {
      const req = {
        server: {},
        raw: {},
        id: 0,
      };

      expect(isFastify(req)).toBe(true);
    });

    it('should return true when req.id is empty string (falsy but defined)', () => {
      const req = {
        server: {},
        raw: {},
        id: '',
      };

      expect(isFastify(req)).toBe(true);
    });

    it('should return false for primitive values', () => {
      expect(isFastify('string')).toBe(false);
      expect(isFastify(123)).toBe(false);
      expect(isFastify(true)).toBe(false);
    });
  });

  describe('isHono', () => {
    it('should return true for valid Hono context object', () => {
      const ctx = {
        header: jest.fn(),
        res: {},
      };

      expect(isHono(ctx)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isHono(null)).toBe(false);
      expect(isHono(undefined)).toBe(false);
    });

    it('should return false when req.header is not a function', () => {
      const ctx = {
        header: 'not a function',
        res: {},
      };

      expect(isHono(ctx)).toBe(false);
    });

    it('should return false when req.header is undefined', () => {
      const ctx = {
        res: {},
      };

      expect(isHono(ctx)).toBe(false);
    });

    it('should return false when req.res is undefined', () => {
      const ctx = {
        header: jest.fn(),
      };

      expect(isHono(ctx)).toBe(false);
    });

    it('should return true when req.res is null (defined but falsy)', () => {
      const ctx = {
        header: jest.fn(),
        res: null,
      };

      expect(isHono(ctx)).toBe(true);
    });

    it('should return true when req.res is 0 (defined but falsy)', () => {
      const ctx = {
        header: jest.fn(),
        res: 0,
      };

      expect(isHono(ctx)).toBe(true);
    });

    it('should return false for primitive values', () => {
      expect(isHono('string')).toBe(false);
      expect(isHono(123)).toBe(false);
      expect(isHono(true)).toBe(false);
    });
  });

  describe('cross-framework detection', () => {
    it('should not detect Express as Fastify', () => {
      const req = {
        app: {},
        headers: {},
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(true);
      expect(isFastify(req)).toBe(false);
    });

    it('should not detect Express as Hono', () => {
      const req = {
        app: {},
        headers: {},
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(true);
      expect(isHono(req)).toBe(false);
    });

    it('should not detect Fastify as Express', () => {
      const req = {
        server: {},
        raw: {},
        id: 'request-id',
      };
      const res = {};

      expect(isFastify(req)).toBe(true);
      expect(isExpress(req, res)).toBe(false);
    });

    it('should not detect Fastify as Hono', () => {
      const req = {
        server: {},
        raw: {},
        id: 'request-id',
      };

      expect(isFastify(req)).toBe(true);
      expect(isHono(req)).toBe(false);
    });

    it('should not detect Hono as Express', () => {
      const ctx = {
        header: jest.fn(),
        res: {},
      };
      const res = {};

      expect(isHono(ctx)).toBe(true);
      expect(isExpress(ctx, res)).toBe(false);
    });

    it('should not detect Hono as Fastify', () => {
      const ctx = {
        header: jest.fn(),
        res: {},
      };

      expect(isHono(ctx)).toBe(true);
      expect(isFastify(ctx)).toBe(false);
    });
  });
});