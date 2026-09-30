import { Config, Status } from "../index.js";
import { HealthCheck } from "./types.js";
import {Redis} from "ioredis";
import Memcached from "memcached";

const checkMemcached = async (connection: string): Promise<boolean> => {
  try {
    const client = new Memcached(connection.replace("memcached://", ""));

    await new Promise((resolve, reject) => {
      client.version((err, result) => {
        client.end();
        if (err) reject(err);
        else resolve(result);
      });
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * A client per check, always disconnected afterwards.
 *
 * This used to `quit()` only on success. A failed ping left the client behind,
 * and ioredis reconnects forever by default — so every check against a down
 * Redis added another socket retrying in the background, for good.
 */
const checkRedis = async (connection: string): Promise<boolean> => {
  const client = new Redis(connection, {
    lazyConnect: true,
    connectTimeout: 5000,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  });
  // Without a listener ioredis reports connection errors as unhandled events.
  client.on("error", () => {});
  try {
    await client.connect();
    await client.ping();
    return true;
  } catch (error) {
    return false;
  } finally {
    client.disconnect();
  }
}

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

  let result;
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
  }
};
