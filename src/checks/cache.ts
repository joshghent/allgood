import { Config, Status } from "../index.js";
import { HealthCheck } from "./types.js";
import {Redis} from "ioredis";
import Memcached from "memcached";

export const cacheConnection = async (config: Config): Promise<HealthCheck> => {
  const start = Date.now();
  if (!config.cache_connection) {
    return {
      componentName: "cache_connection",
      status: Status.fail,
      message: "Cche connection string not configured",
      value: "N/A",
      time: Date.now() - start,
    };
  }

  const isRedis = config.cache_connection.toLowerCase().startsWith("redis://");
  const isMemcached = config.cache_connection.toLowerCase().startsWith("memcached://");

  try {
    if (isRedis) {
      const client = new Redis(config.cache_connection);
      await client.ping();
      await client.quit();

      return {
        componentName: "cache_connection",
        status: Status.pass,
        message: "Successfully connected to Redis",
        value: "true",
        time: Date.now() - start,
      };
    } else if (isMemcached) {
      const client = new Memcached(config.cache_connection.replace("memcached://", ""));

      await new Promise((resolve, reject) => {
        client.version((err, result) => {
          client.end();
          if (err) reject(err);
          else resolve(result);
        });
      });

      return {
        componentName: "cache_connection",
        status: Status.pass,
        message: "Successfully connected to Memcached",
        value: "N/A",
        time: Date.now() - start,
      };
    }

    return {
      componentName: "cache_connection",
      status: Status.fail,
      message: "Unsupported cache type. Only Redis and Memcached are supported",
      value: "N/A",
      time: Date.now() - start,
    };
  } catch (error) {
    return {
      componentName: "cache_connection",
      status: Status.fail,
      message: `Failed to connect to cache`,
      value: "N/A",
      time: Date.now() - start,
    };
  }
};
