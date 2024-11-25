import { cacheConnection } from './cache.js';
import { Redis } from 'ioredis';
import Memcached from 'memcached';
import { Status } from '../index.js';

jest.mock('ioredis', () => ({
  Redis: jest.fn(),
}));

jest.mock('memcached', () => {
  return jest.fn().mockImplementation(() => ({
    version: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    connect: jest.fn(),
  }));
});

describe('cache', () => {
  let mockRedisInstance: jest.Mocked<Redis>;
  let mockMemcachedInstance: jest.Mocked<Memcached>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Redis instance with required methods
    mockRedisInstance = {
      ping: jest.fn(),
      quit: jest.fn(),
      disconnect: jest.fn(),
      connect: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    (Redis as unknown as jest.Mock).mockImplementation(() => mockRedisInstance);

    // Mock Memcached instance with required methods
    mockMemcachedInstance = {
      version: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      connect: jest.fn(),
    } as unknown as jest.Mocked<Memcached>;

    (Memcached as unknown as jest.Mock).mockImplementation(() => mockMemcachedInstance);
  });

  it('should return a fail with an error when the connection string is not provided', async () => {
    // @ts-expect-error
    const result = await cacheConnection({});

    expect(result).toEqual({
      componentName: 'cache_connection',
      status: Status.fail,
      message: 'Cache connection string not configured',
      value: 'N/A',
      time: expect.any(Number),
    });
  });

  it('should return a fail when an unsupported cache type is provided', async () => {
    const result = await cacheConnection({
      cache_connection: 'mongodb://localhost:27017',
      checks: {
        cache_connection: true
      }
    });

    expect(result).toEqual({
      componentName: 'cache_connection',
      status: Status.fail,
      message: 'Unsupported cache type. Only Redis and Memcached are supported',
      value: 'N/A',
      time: expect.any(Number),
    });
  });

  it('should successfully check the status of a Redis connection', async () => {
    mockRedisInstance.ping.mockResolvedValue('PONG');
    mockRedisInstance.quit.mockResolvedValue('OK');

    const result = await cacheConnection({
      cache_connection: 'redis://localhost:6379',
      checks: {
        cache_connection: true
      }
    });

    expect(Redis).toHaveBeenCalledWith('redis://localhost:6379');
    expect(mockRedisInstance.ping).toHaveBeenCalled();
    expect(mockRedisInstance.quit).toHaveBeenCalled();
    expect(result).toEqual({
      componentName: 'cache_connection',
      status: Status.pass,
      message: 'Cache connection successful',
      value: 'true',
      time: expect.any(Number),
    });
  });

  it('should successfully check the status of a Memcached connection', async () => {
    mockMemcachedInstance.version.mockImplementation((callback) => callback(null, [{
      server: 'localhost:11211',
      version: '1.0.0',
      major: '1',
      minor: '0',
      bugfix: '0'
    }]));
    mockMemcachedInstance.end.mockImplementation(jest.fn);

    const result = await cacheConnection({
      cache_connection: 'memcached://localhost:11211',
      checks: {
        cache_connection: true
      }
    });

    expect(Memcached).toHaveBeenCalledWith('localhost:11211');
    expect(mockMemcachedInstance.version).toHaveBeenCalled();
    expect(mockMemcachedInstance.end).toHaveBeenCalled();
    expect(result).toEqual({
      componentName: 'cache_connection',
      status: Status.pass,
      message: 'Cache connection successful',
      value: 'true',
      time: expect.any(Number),
    });
  });

  it('should handle Redis connection failure', async () => {
    mockRedisInstance.ping.mockRejectedValue(new Error('Connection failed'));
    mockRedisInstance.quit.mockResolvedValue('OK');

    const result = await cacheConnection({
      cache_connection: 'redis://localhost:6379',
      checks: {
        cache_connection: true
      }
    });

    expect(result).toEqual({
      componentName: 'cache_connection',
      status: Status.fail,
      message: 'Cache connection failed',
      value: 'false',
      time: expect.any(Number),
    });
  });

  it('should handle Memcached connection failure', async () => {
    mockMemcachedInstance.version.mockImplementation((callback) =>
      callback(new Error('Connection failed'), [{
        server: 'localhost:11211',
        version: '1.0.0',
        major: '1',
        minor: '0',
        bugfix: '0'
      }])
    );
    mockMemcachedInstance.end.mockImplementation(jest.fn);

    const result = await cacheConnection({
      cache_connection: 'memcached://localhost:11211',
      checks: {
        cache_connection: true
      }
    });

    expect(result).toEqual({
      componentName: 'cache_connection',
      status: Status.fail,
      message: 'Cache connection failed',
      value: 'false',
      time: expect.any(Number),
    });
  });
});
