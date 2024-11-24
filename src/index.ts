import { expressHealthCheck } from "./adapters/express.js";
import { fastifyHealthCheck } from "./adapters/fastify.js";
import { honoHealthCheck } from "./adapters/hono.js";
import { isExpress, isFastify, isHono } from "./detect.js";
import merge from "lodash.merge";

export interface Config {
  db_connection?: string; // the database connection string
  cache_connection?: string; //redis or memcache
  checks: {
    db_connection?: boolean;
    db_migrations?: boolean;
    cache_connection?: boolean;
    disk_space?: boolean;
    memory_usage?: boolean;
    outbound_internet?: boolean;
    cpu_usage?: boolean;
  };
}

const defaultConfig = {
  checks: {
    db_connection: false,
    db_migrations: false,
    cache_connection: false,
    disk_space: true,
    memory_usage: true,
    outbound_internet: true,
    cpu_usage: true
  },
};

type GenericRequest = any;
type GenericResponse = any;

export enum Status {
  pass = "pass",
  fail = "fail",
  warn = "warn",
}

export const createHealthCheck = (config: Config) => {
  const mergedConfig = merge(defaultConfig, config);
  return function (req: GenericRequest, res: GenericResponse): Promise<void | Response> {
    // Detect the framework

    // Express
    if (req && res && isExpress(req, res)) {
      return expressHealthCheck(req, res, mergedConfig);
    }
    // Fastify
    if (req && req.server && isFastify(req)) {
      return fastifyHealthCheck(req, res, mergedConfig);
    }
    // Hono
    if (req && isHono(req)) {
      return honoHealthCheck(req, mergedConfig);
    }

    throw new Error(
      "❌ Unsupported framework detected. The app must be an instance of Express, Fastify or Hono. Please raise an issue at https://github.com/joshghent/allgood to request framework support!"
    );
  };
};

export default createHealthCheck;
