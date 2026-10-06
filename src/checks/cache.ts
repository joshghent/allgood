import net from "node:net";
import { Redis } from "ioredis";
import { type Config, Status } from "../index.js";
import type { HealthCheck } from "./types.js";

const TIMEOUT_MS = 5000;

/**
 * Sends `version` over a plain socket and expects `VERSION …` back.
 *
 * This used the `memcached` client, which retried a down server for minutes,
 * waited forever on one that accepted the connection but never replied, and
 * only closed pooled sockets on `end()`, so a pending connect outlived it. A
 * health check needs one round trip; the idle timeout covers connecting and
 * waiting, and every path destroys the socket.
 */
const checkMemcached = (connection: string): Promise<boolean> => {
  const { hostname, port } = new URL(connection);
  return new Promise((resolve) => {
    const socket = net.connect({ host: hostname.replace(/^\[|\]$/g, ""), port: Number(port) || 11211 });
    const done = (ok: boolean) => {
      socket.destroy();
      resolve(ok);
    };
    let reply = "";
    socket.setTimeout(TIMEOUT_MS, () => done(false));
    socket.on("error", () => done(false));
    socket.on("connect", () => socket.write("version\r\n"));
    socket.on("data", (chunk) => {
      reply += chunk;
      if (reply.includes("\r\n")) done(reply.startsWith("VERSION "));
    });
  });
};

/** Rejects if `promise` hasn't settled in `ms`. */
const within = async <T>(ms: number, promise: Promise<T>): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, deadline]);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * A client per check, always disconnected afterwards.
 *
 * This used to `quit()` only on success. A failed ping left the client behind,
 * and ioredis reconnects forever by default — so every check against a down
 * Redis added another socket retrying in the background, for good.
 *
 * `connectTimeout` only covers the TCP connect. A server that accepts and then
 * never replies left `connect()` waiting on its handshake for good, hence the
 * deadline around the whole exchange. `disconnectTimeout: 0` destroys the
 * socket straight away; the default waits 2s for the server to close its side.
 */
const checkRedis = async (connection: string): Promise<boolean> => {
  const client = new Redis(connection, {
    lazyConnect: true,
    connectTimeout: TIMEOUT_MS,
    disconnectTimeout: 0,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  });
  // Without a listener ioredis reports connection errors as unhandled events.
  client.on("error", () => {});
  try {
    await within(
      TIMEOUT_MS,
      client.connect().then(() => client.ping()),
    );
    return true;
  } catch {
    return false;
  } finally {
    client.disconnect();
  }
};

export const cacheConnection = async (config: Config): Promise<HealthCheck> => {
  const start = Date.now();
  if (!config.cache_connection) {
    return {
      componentName: "cache_connection",
      status: Status.fail,
      message: "Cache connection string not configured",
      value: "N/A",
      time: Date.now() - start,
    };
  }

  const isRedis = config.cache_connection.toLowerCase().startsWith("redis://");
  const isMemcached = config.cache_connection.toLowerCase().startsWith("memcached://");

  let result: boolean;
  if (isRedis) {
    result = await checkRedis(config.cache_connection);
  } else if (isMemcached) {
    result = await checkMemcached(config.cache_connection);
  } else {
    return {
      componentName: "cache_connection",
      status: Status.fail,
      message: "Unsupported cache type. Only Redis and Memcached are supported",
      value: "N/A",
      time: Date.now() - start,
    };
  }

  return {
    componentName: "cache_connection",
    status: result ? Status.pass : Status.fail,
    message: result ? "Cache connection successful" : "Cache connection failed",
    value: result ? "true" : "false",
    time: Date.now() - start,
  };
};
