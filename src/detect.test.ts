import { isExpress, isFastify, isHono } from './detect.js';

describe('detect', () => {
  describe('isExpress', () => {
    it('should return true for a valid Express request/response pair', () => {
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
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(null, res)).toBe(false);
      expect(isExpress('string', res)).toBe(false);
      expect(isExpress(undefined, res)).toBe(false);
    });

    it('should return false when res is not an object', () => {
      const req = {
        app: {},
        headers: {},
      };

      expect(isExpress(req, null)).toBe(false);
      expect(isExpress(req, 'string')).toBe(false);
      expect(isExpress(req, undefined)).toBe(false);
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
        setHeader: 'not-a-function',
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
        send: 'not-a-function',
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false when both req and res are missing required properties', () => {
      const req = {};
      const res = {};

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false for a Fastify-like request', () => {
      const req = {
        server: {},
        raw: {},
        id: '123',
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should return false for a Hono-like request', () => {
      const req = {
        header: jest.fn(),
        res: {},
      };
      const res = {};

      expect(isExpress(req, res)).toBe(false);
    });
  });

  describe('isFastify', () => {
    it('should return true for a valid Fastify request', () => {
      const req = {
        server: {},
        raw: {},
        id: '123',
      };

      expect(isFastify(req)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isFastify(null)).toBe(false);
      expect(isFastify('string')).toBe(false);
      expect(isFastify(undefined)).toBe(false);
      expect(isFastify(42)).toBe(false);
    });

    it('should return false when req.server is undefined', () => {
      const req = {
        raw: {},
        id: '123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.server is falsy', () => {
      const req = {
        server: null,
        raw: {},
        id: '123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.server is not an object', () => {
      const req = {
        server: 'not-an-object',
        raw: {},
        id: '123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.raw is not an object', () => {
      const req = {
        server: {},
        raw: 'not-an-object',
        id: '123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.raw is undefined', () => {
      const req = {
        server: {},
        id: '123',
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

    it('should return false for an Express-like request', () => {
      const req = {
        app: {},
        headers: {},
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false for a Hono-like request', () => {
      const req = {
        header: jest.fn(),
        res: {},
      };

      expect(isFastify(req)).toBe(false);
    });
  });

  describe('isHono', () => {
    it('should return true for a valid Hono context', () => {
      const req = {
        header: jest.fn(),
        res: {},
      };

      expect(isHono(req)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isHono(null)).toBe(false);
      expect(isHono('string')).toBe(false);
      expect(isHono(undefined)).toBe(false);
      expect(isHono(42)).toBe(false);
    });

    it('should return false when req.header is not a function', () => {
      const req = {
        header: 'not-a-function',
        res: {},
      };

      expect(isHono(req)).toBe(false);
    });

    it('should return false when req.header is undefined', () => {
      const req = {
        res: {},
      };

      expect(isHono(req)).toBe(false);
    });

    it('should return false when req.res is undefined', () => {
      const req = {
        header: jest.fn(),
      };

      expect(isHono(req)).toBe(false);
    });

    it('should return true when req.res is null (defined but falsy)', () => {
      const req = {
        header: jest.fn(),
        res: null,
      };

      expect(isHono(req)).toBe(true);
    });

    it('should return false for an Express-like request', () => {
      const req = {
        app: {},
        headers: {},
      };

      expect(isHono(req)).toBe(false);
    });

    it('should return false for a Fastify-like request', () => {
      const req = {
        server: {},
        raw: {},
        id: '123',
      };

      expect(isHono(req)).toBe(false);
    });
  });
});