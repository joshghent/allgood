import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Context as HonoContext } from "hono";
import merge from "lodash.merge";
import { expressHealthCheck } from "./adapters/express.js";
import { fastifyHealthCheck } from "./adapters/fastify.js";
import { honoHealthCheck } from "./adapters/hono.js";
import { webHealthCheck } from "./adapters/web.js";
import { isExpress, isExpressResponse, isFastify, isFastifyReply, isHono, isWebRequest } from "./detect.js";

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
    cpu_usage: true,
  },
};

export enum Status {
  pass = "pass",
  fail = "fail",
  warn = "warn",
}

export const createHealthCheck = (config: Config) => {
  // Merged into a fresh object: lodash's merge writes into its first argument,
  // so merging into defaultConfig leaked one call's options into every later
  // createHealthCheck in the same process.
  const mergedConfig = merge({}, defaultConfig, config);

  // One signature per framework, so the handler type-checks wherever it's
  // mounted. The Fetch API one is last: TypeScript reads Parameters<> and
  // ReturnType<> from the last overload, which is what a Next.js route sees.
  function healthCheck(req: ExpressRequest, res: ExpressResponse): Promise<void>;
  function healthCheck(req: FastifyRequest, reply: FastifyReply): Promise<void>;
  function healthCheck(c: HonoContext): Promise<Response>;
  function healthCheck(req: Request, context?: unknown): Promise<Response>;
  function healthCheck(req: unknown, res?: unknown): Promise<void> | Promise<Response> {
    // Next.js App Router and anything else on the Fetch API. First, because a
    // Web Request is unambiguous; the second argument is Next's route context.
    if (isWebRequest(req)) {
      return webHealthCheck(req, mergedConfig);
    }
    if (isExpress(req) && isExpressResponse(res)) {
      return expressHealthCheck(req, res, mergedConfig);
    }
    if (isFastify(req) && isFastifyReply(res)) {
      return fastifyHealthCheck(req, res, mergedConfig);
    }
    if (isHono(req)) {
      return honoHealthCheck(req, mergedConfig);
    }

    throw new Error(
      "❌ Unsupported framework detected. The app must be an instance of Express, Fastify, Hono or a Fetch API framework such as Next.js. Please raise an issue at https://github.com/joshghent/allgood to request framework support!",
    );
  }

  return healthCheck;
};

export default createHealthCheck;

export { closeDbClients } from "./checks/db.js";
