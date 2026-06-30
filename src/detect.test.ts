import { isExpress, isFastify, isHono } from './detect.js';

describe('detect', () => {
  describe('isExpress', () => {
    it('should return true for valid Express request and response objects', () => {
      const req = {
        app: {},
        headers: {},
        method: 'GET',
        url: '/',
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
        status: jest.fn(),
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

    it('should return false for primitive values', () => {
      expect(isExpress('string', {})).toBe(false);
      expect(isExpress(123, {})).toBe(false);
      expect(isExpress(true, {})).toBe(false);
      expect(isExpress(undefined, undefined)).toBe(false);
    });
  });

  describe('isFastify', () => {
    it('should return true for valid Fastify request object', () => {
      const req = {
        server: {},
        raw: {},
        id: '123',
        log: {},
      };

      expect(isFastify(req)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isFastify(null)).toBe(false);
      expect(isFastify(undefined)).toBe(false);
      expect(isFastify('string')).toBe(false);
      expect(isFastify(123)).toBe(false);
    });

    it('should return false when server is undefined', () => {
      const req = {
        raw: {},
        id: '123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when server is not an object', () => {
      const req = {
        server: 'not an object',
        raw: {},
        id: '123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when raw is not an object', () => {
      const req = {
        server: {},
        raw: 'not an object',
        id: '123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when id is undefined', () => {
      const req = {
        server: {},
        raw: {},
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return true when id is a number', () => {
      const req = {
        server: {},
        raw: {},
        id: 456,
      };

      expect(isFastify(req)).toBe(true);
    });

    it('should return true when id is an empty string', () => {
      const req = {
        server: {},
        raw: {},
        id: '',
      };

      expect(isFastify(req)).toBe(true);
    });
  });

  describe('isHono', () => {
    it('should return true for valid Hono context object', () => {
      const ctx = {
        header: jest.fn(),
        res: {},
        req: {},
      };

      expect(isHono(ctx)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isHono(null)).toBe(false);
      expect(isHono(undefined)).toBe(false);
      expect(isHono('string')).toBe(false);
      expect(isHono(123)).toBe(false);
      expect(isHono(true)).toBe(false);
    });

    it('should return false when header is not a function', () => {
      const ctx = {
        header: 'not a function',
        res: {},
      };

      expect(isHono(ctx)).toBe(false);
    });

    it('should return false when header is undefined', () => {
      const ctx = {
        res: {},
      };

      expect(isHono(ctx)).toBe(false);
    });

    it('should return false when res is undefined', () => {
      const ctx = {
        header: jest.fn(),
      };

      expect(isHono(ctx)).toBe(false);
    });

    it('should return true when res is null (typeof null === "object")', () => {
      const ctx = {
        header: jest.fn(),
        res: null,
      };

      expect(isHono(ctx)).toBe(true);
    });

    it('should return true with minimal valid properties', () => {
      const ctx = {
        header: () => {},
        res: {},
      };

      expect(isHono(ctx)).toBe(true);
    });
  });

  describe('cross-framework detection', () => {
    it('should not detect Express request as Fastify', () => {
      const req = {
        app: {},
        headers: {},
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should not detect Express request as Hono', () => {
      const req = {
        app: {},
        headers: {},
      };

      expect(isHono(req)).toBe(false);
    });

    it('should not detect Fastify request as Express', () => {
      const req = {
        server: {},
        raw: {},
        id: '123',
      };
      const res = {};

      expect(isExpress(req, res)).toBe(false);
    });

    it('should not detect Fastify request as Hono', () => {
      const req = {
        server: {},
        raw: {},
        id: '123',
      };

      expect(isHono(req)).toBe(false);
    });

    it('should not detect Hono context as Express', () => {
      const ctx = {
        header: jest.fn(),
        res: {},
      };
      const res = {};

      expect(isExpress(ctx, res)).toBe(false);
    });

    it('should not detect Hono context as Fastify', () => {
      const ctx = {
        header: jest.fn(),
        res: {},
      };

      expect(isFastify(ctx)).toBe(false);
    });
  });
});