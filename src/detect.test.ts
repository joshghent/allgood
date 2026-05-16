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

    it('should return false for undefined req and res', () => {
      expect(isExpress(undefined, undefined)).toBe(false);
    });

    it('should return false for empty objects', () => {
      expect(isExpress({}, {})).toBe(false);
    });
  });

  describe('isFastify', () => {
    it('should return true for valid Fastify request object', () => {
      const req = {
        server: {},
        raw: {},
        id: 'request-id-123',
        headers: {},
      };

      expect(isFastify(req)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isFastify(null)).toBe(false);
    });

    it('should return false when req is undefined', () => {
      expect(isFastify(undefined)).toBe(false);
    });

    it('should return false when req.server is undefined', () => {
      const req = {
        raw: {},
        id: 'request-id-123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.server is not an object', () => {
      const req = {
        server: 'not an object',
        raw: {},
        id: 'request-id-123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.raw is undefined', () => {
      const req = {
        server: {},
        id: 'request-id-123',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false when req.raw is not an object', () => {
      const req = {
        server: {},
        raw: 'not an object',
        id: 'request-id-123',
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

    it('should return true when req.id is an empty string', () => {
      const req = {
        server: {},
        raw: {},
        id: '',
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isFastify({})).toBe(false);
    });
  });

  describe('isHono', () => {
    it('should return true for valid Hono context object', () => {
      const req = {
        header: jest.fn(),
        res: {},
        req: {},
      };

      expect(isHono(req)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isHono(null)).toBe(false);
    });

    it('should return false when req is undefined', () => {
      expect(isHono(undefined)).toBe(false);
    });

    it('should return false when req.header is not a function', () => {
      const req = {
        header: 'not a function',
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

    it('should return true when req.res is null', () => {
      const req = {
        header: jest.fn(),
        res: null,
      };

      expect(isHono(req)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isHono({})).toBe(false);
    });

    it('should return false for string', () => {
      expect(isHono('string')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isHono(123)).toBe(false);
    });
  });

  describe('cross-framework detection', () => {
    it('should not detect Express as Fastify', () => {
      const req = {
        app: {},
        headers: {},
      };

      expect(isFastify(req)).toBe(false);
    });

    it('should not detect Express as Hono', () => {
      const req = {
        app: {},
        headers: {},
      };

      expect(isHono(req)).toBe(false);
    });

    it('should not detect Fastify as Express', () => {
      const req = {
        server: {},
        raw: {},
        id: 'request-id-123',
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should not detect Fastify as Hono', () => {
      const req = {
        server: {},
        raw: {},
        id: 'request-id-123',
      };

      expect(isHono(req)).toBe(false);
    });

    it('should not detect Hono as Express', () => {
      const req = {
        header: jest.fn(),
        res: {},
      };
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(req, res)).toBe(false);
    });

    it('should not detect Hono as Fastify', () => {
      const req = {
        header: jest.fn(),
        res: {},
      };

      expect(isFastify(req)).toBe(false);
    });
  });
});