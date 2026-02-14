import { isExpress, isFastify, isHono } from './detect.js';

describe('detect', () => {
  describe('isExpress', () => {
    it('should return true for a valid Express request and response', () => {
      const mockReq = {
        app: {},
        headers: {},
      };
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(mockReq, mockRes)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(null, mockRes)).toBe(false);
      expect(isExpress(undefined, mockRes)).toBe(false);
      expect(isExpress('string', mockRes)).toBe(false);
      expect(isExpress(123, mockRes)).toBe(false);
    });

    it('should return false when res is not an object', () => {
      const mockReq = {
        app: {},
        headers: {},
      };

      expect(isExpress(mockReq, null)).toBe(false);
      expect(isExpress(mockReq, undefined)).toBe(false);
      expect(isExpress(mockReq, 'string')).toBe(false);
      expect(isExpress(mockReq, 123)).toBe(false);
    });

    it('should return false when req.app is undefined', () => {
      const mockReq = {
        headers: {},
      };
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });

    it('should return false when req.headers is undefined', () => {
      const mockReq = {
        app: {},
      };
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });

    it('should return false when res.setHeader is not a function', () => {
      const mockReq = {
        app: {},
        headers: {},
      };
      const mockRes = {
        setHeader: 'not a function',
        send: jest.fn(),
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });

    it('should return false when res.send is not a function', () => {
      const mockReq = {
        app: {},
        headers: {},
      };
      const mockRes = {
        setHeader: jest.fn(),
        send: 'not a function',
      };

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });

    it('should return false when multiple properties are missing', () => {
      const mockReq = {};
      const mockRes = {};

      expect(isExpress(mockReq, mockRes)).toBe(false);
    });
  });

  describe('isFastify', () => {
    it('should return true for a valid Fastify request', () => {
      const mockReq = {
        server: {},
        raw: {},
        id: 'request-id',
      };

      expect(isFastify(mockReq)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isFastify(null)).toBe(false);
      expect(isFastify(undefined)).toBe(false);
      expect(isFastify('string')).toBe(false);
      expect(isFastify(123)).toBe(false);
    });

    it('should return false when server is missing', () => {
      const mockReq = {
        raw: {},
        id: 'request-id',
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return false when server is not an object', () => {
      const mockReq = {
        server: 'not an object',
        raw: {},
        id: 'request-id',
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return false when raw is missing', () => {
      const mockReq = {
        server: {},
        id: 'request-id',
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return false when raw is not an object', () => {
      const mockReq = {
        server: {},
        raw: 'not an object',
        id: 'request-id',
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return false when id is undefined', () => {
      const mockReq = {
        server: {},
        raw: {},
      };

      expect(isFastify(mockReq)).toBe(false);
    });

    it('should return true when id is 0 (falsy but not undefined)', () => {
      const mockReq = {
        server: {},
        raw: {},
        id: 0,
      };

      expect(isFastify(mockReq)).toBe(true);
    });

    it('should return true when id is empty string (falsy but not undefined)', () => {
      const mockReq = {
        server: {},
        raw: {},
        id: '',
      };

      expect(isFastify(mockReq)).toBe(true);
    });
  });

  describe('isHono', () => {
    it('should return true for a valid Hono context', () => {
      const mockContext = {
        header: jest.fn(),
        res: {},
      };

      expect(isHono(mockContext)).toBe(true);
    });

    it('should return false when req is not an object', () => {
      expect(isHono(null)).toBe(false);
      expect(isHono(undefined)).toBe(false);
      expect(isHono('string')).toBe(false);
      expect(isHono(123)).toBe(false);
    });

    it('should return false when header is not a function', () => {
      const mockContext = {
        header: 'not a function',
        res: {},
      };

      expect(isHono(mockContext)).toBe(false);
    });

    it('should return false when header is missing', () => {
      const mockContext = {
        res: {},
      };

      expect(isHono(mockContext)).toBe(false);
    });

    it('should return false when res is undefined', () => {
      const mockContext = {
        header: jest.fn(),
      };

      expect(isHono(mockContext)).toBe(false);
    });

    it('should return true when res is null (not undefined)', () => {
      const mockContext = {
        header: jest.fn(),
        res: null,
      };

      expect(isHono(mockContext)).toBe(true);
    });

    it('should return true when res is any truthy value', () => {
      const mockContext = {
        header: jest.fn(),
        res: 'anything',
      };

      expect(isHono(mockContext)).toBe(true);
    });
  });

  describe('framework disambiguation', () => {
    it('should not confuse Express with Fastify', () => {
      const expressReq = {
        app: {},
        headers: {},
      };
      const expressRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      expect(isExpress(expressReq, expressRes)).toBe(true);
      expect(isFastify(expressReq)).toBe(false);
      expect(isHono(expressReq)).toBe(false);
    });

    it('should not confuse Fastify with Express or Hono', () => {
      const fastifyReq = {
        server: {},
        raw: {},
        id: 'request-id',
      };

      expect(isFastify(fastifyReq)).toBe(true);
      expect(isHono(fastifyReq)).toBe(false);
    });

    it('should not confuse Hono with Express or Fastify', () => {
      const honoContext = {
        header: jest.fn(),
        res: {},
      };

      expect(isHono(honoContext)).toBe(true);
      expect(isFastify(honoContext)).toBe(false);
    });
  });
});