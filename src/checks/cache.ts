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

const checkRedis = async (connection: string): Promise<boolean> => {
  try {
    const client = new Redis(connection);
    await client.ping();
    await client.quit();
    return true;
  } catch (error) {
    return false;
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
