import { cacheConnection } from './cache.js';
import { Redis } from 'ioredis';
import net, { type AddressInfo } from 'node:net';
import { once } from 'node:events';
import { Status } from '../index.js';

jest.mock('ioredis', () => ({
  Redis: jest.fn(),
}));

/** A local TCP server that answers every chunk with `reply`. */
const memcachedServer = async (reply: string) => {
  const server = net.createServer((s) => s.on('data', () => s.write(reply))).listen(0, '127.0.0.1');
  await once(server, 'listening');
  return { url: `memcached://127.0.0.1:${(server.address() as AddressInfo).port}`, server };
};

describe('cache', () => {
  let mockRedisInstance: jest.Mocked<Redis>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Redis instance with required methods
    mockRedisInstance = {
      ping: jest.fn(),
      quit: jest.fn(),
      disconnect: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    (Redis as unknown as jest.Mock).mockImplementation(() => mockRedisInstance);
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

    expect(Redis).toHaveBeenCalledWith('redis://localhost:6379', expect.objectContaining({ lazyConnect: true }));
    expect(mockRedisInstance.ping).toHaveBeenCalled();
    expect(mockRedisInstance.disconnect).toHaveBeenCalled();
    expect(result).toEqual({
      componentName: 'cache_connection',
      status: Status.pass,
      message: 'Cache connection successful',
      value: 'true',
      time: expect.any(Number),
    });
  });

  it('should successfully check the status of a Memcached connection', async () => {
    const { url, server } = await memcachedServer('VERSION 1.6.29\r\n');

    const result = await cacheConnection({ cache_connection: url, checks: { cache_connection: true } });
    server.close();

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

  it('should fail when the server answers with something other than VERSION', async () => {
    const { url, server } = await memcachedServer('ERROR\r\n');

    const result = await cacheConnection({ cache_connection: url, checks: { cache_connection: true } });
    server.close();

    expect(result).toEqual({
      componentName: 'cache_connection',
      status: Status.fail,
      message: 'Cache connection failed',
      value: 'false',
      time: expect.any(Number),
    });
  });

  it('should fail when nothing listens on the Memcached port', async () => {
    const { url, server } = await memcachedServer('');
    server.close();
    await once(server, 'close');

    const result = await cacheConnection({ cache_connection: url, checks: { cache_connection: true } });

    expect(result.status).toBe(Status.fail);
  });

  it('disconnects the Redis client even when the ping fails', async () => {
    mockRedisInstance.ping.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await cacheConnection({
      cache_connection: 'redis://localhost:6379',
      checks: { cache_connection: true },
    });

    expect(result.status).toBe(Status.fail);
    expect(mockRedisInstance.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not let a failed Redis client retry forever', async () => {
    await cacheConnection({ cache_connection: 'redis://localhost:6379', checks: { cache_connection: true } });

    const options = (Redis as unknown as jest.Mock).mock.calls[0][1];
    expect(options.retryStrategy()).toBeNull();
  });
});
