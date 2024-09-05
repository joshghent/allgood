import { isExpress, isFastify, isHono } from "./detect.js";

export interface Config {
  db_connection_string?: unknown; // the ORM/database instance
  cache_connection_string?: unknown; //redis or memcache
  checks: {
    db_connection?: boolean;
    db_simple_query?: boolean;
    db_migrations?: boolean;
    cache_connection?: boolean;
    disk_space?: boolean;
    memory_usage?: boolean;
    outbound_internet?: boolean;
  };
}

const defaultConfig = {
  checks: {
    db_connection: true,
    db_simple_query: true,
    db_migrations: true,
    cache_connection: true,
    disk_space: true,
    memory_usage: true,
    outbound_internet: true,
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
  const mergedConfig = { ...defaultConfig, ...config };
  return function (req: GenericRequest, res: GenericResponse): void {
    // Detect the framework

    // Express
    if (req && res && isExpress(req, res)) {
    }
    // Fastify
    if (req && req.server && isFastify(req)) {
    }
    // Hono
    if (req && isHono(req)) {
    }

    throw new Error(
      "❌ Unsupported framework detected. The app must be an instance of Express, Fastify or Hono. Please raise an issue at https://github.com/joshghent/allgood to request framework support!"
    );
  };
};
