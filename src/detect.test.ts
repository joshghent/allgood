import { isExpress, isFastify, isHono } from './detect.js';
import { type Request as ExpressRequest } from 'express';
import { type FastifyRequest } from 'fastify';
import { type Context as HonoContext } from 'hono';

describe('detect', () => {
  describe('isExpress', () => {
    it('should return true for valid Express request and response objects', () => {
      const mockReq = {
        app: {},
        headers: {},
        method: 'GET',
        url: '/'
      } as ExpressRequest;

      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
        status: jest.fn()
      };

      expect(isExpress(mockReq, mockRes)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn()
      };

      expect(isExpress(null, mockRes)).toBe(false);
      expect(isExpress(undefined, mockRes)).toBe(false);
      expect(isExpress('string', mockRes)).toBe(false);
      expect(isExpress(123, mockRes)).toBe(false);
    });

    it('should return false when res is not an object', () => {
      const mockReq = {
        app: {},
        headers: {}
      };

      expect(isExpress(mockReq, null)).toBe(false);
      expect(isExpress(mockReq, undefined)).toBe(false);
      expect(isExpress(mockReq, 'string')).toBe(false);
      expect(isExpress(mockReq, 123)).toBe(false);
    });

    it('should return false when req.app is undefined', () => {
      const mockReq = {
        headers: {}
      };

      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn()
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });

    it('should return false when req.headers is undefined', () => {
      const mockReq = {
        app: {}
      };

      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn()
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });

    it('should return false when res.setHeader is not a function', () => {
      const mockReq = {
        app: {},
        headers: {}
      };

      const mockRes = {
        setHeader: 'not a function',
        send: jest.fn()
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });

    it('should return false when res.send is not a function', () => {
      const mockReq = {
        app: {},
        headers: {}
      };

      const mockRes = {
        setHeader: jest.fn(),
        send: 'not a function'
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });

    it('should return false for Fastify-like objects', () => {
      const mockReq = {
        server: {},
        raw: {},
        id: '123'
      };

      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn()
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });
  });

  describe('isFastify', () => {
    it('should return true for valid Fastify request object', () => {
      const mockReq = {
        server: {
          log: {}
        },
        raw: {
          method: 'GET'
        },
        id: 'req-123',
        headers: {}
      } as Partial<FastifyRequest>;

      expect(isFastify(mockReq)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isFastify(null)).toBe(false);
      expect(isFastify(undefined)).toBe(false);
      expect(isFastify('string')).toBe(false);
      expect(isFastify(123)).toBe(false);
    });

    it('should return false when server is undefined', () => {
      const mockReq = {
        raw: {},
        id: '123'
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return false when server is not an object', () => {
      const mockReq = {
        server: 'not an object',
        raw: {},
        id: '123'
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return false when raw is not an object', () => {
      const mockReq = {
        server: {},
        raw: 'not an object',
        id: '123'
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return false when id is undefined', () => {
      const mockReq = {
        server: {},
        raw: {}
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return true when id is null (id can be defined but null)', () => {
      const mockReq = {
        server: {},
        raw: {},
        id: null
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return false for Express-like objects', () => {
      const mockReq = {
        app: {},
        headers: {}
      };

      expect(isFastify(mockReq)).toBe(false);
    });
  });

  describe('isHono', () => {
    it('should return true for valid Hono context object', () => {
      const mockCtx = {
        header: jest.fn(),
        res: {
          status: 200
        },
        req: {}
      } as Partial<HonoContext>;

      expect(isHono(mockCtx)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isHono(null)).toBe(false);
      expect(isHono(undefined)).toBe(false);
      expect(isHono('string')).toBe(false);
      expect(isHono(123)).toBe(false);
    });

    it('should return false when header is not a function', () => {
      const mockCtx = {
        header: 'not a function',
        res: {}
      };

      expect(isHono(mockCtx)).toBe(false);
    });

    it('should return false when header is undefined', () => {
      const mockCtx = {
        res: {}
      };

      expect(isHono(mockCtx)).toBe(false);
    });

    it('should return false when res is undefined', () => {
      const mockCtx = {
        header: jest.fn()
      };

      expect(isHono(mockCtx)).toBe(false);
    });

    it('should return true when res is null (res is defined but null)', () => {
      const mockCtx = {
        header: jest.fn(),
        res: null
      };

      expect(isHono(mockCtx)).toBe(true);
    });

    it('should return false for Express-like objects', () => {
      const mockReq = {
        app: {},
        headers: {}
      };

      expect(isHono(mockReq)).toBe(false);
    });

    it('should return false for Fastify-like objects', () => {
      const mockReq = {
        server: {},
        raw: {},
        id: '123'
      };

      expect(isHono(mockReq)).toBe(false);
    });
  });

  describe('cross-framework detection', () => {
    it('should not detect Express as Fastify', () => {
      const mockReq = {
        app: {},
        headers: {}
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should not detect Express as Hono', () => {
      const mockReq = {
        app: {},
        headers: {}
      };

      expect(isHono(mockReq)).toBe(false);
    });

    it('should not detect Fastify as Hono', () => {
      const mockReq = {
        server: {},
        raw: {},
        id: '123'
      };

      expect(isHono(mockReq)).toBe(false);
    });

    it('should not detect Hono as Fastify', () => {
      const mockCtx = {
        header: jest.fn(),
        res: {}
      };

      expect(isFastify(mockCtx)).toBe(false);
    });
  });
});