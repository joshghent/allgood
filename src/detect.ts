import { type Request as ExpressRequest } from "express";
import { type FastifyRequest } from "fastify";
import { type Context as HonoContext } from "hono";

// Helper function to detect Express
export function isExpress(req: any, res: any): req is ExpressRequest {
  return (
    typeof req === "object" &&
    typeof res === "object" &&
    typeof req.app !== "undefined" &&
    typeof req.headers !== "undefined" &&
    typeof res.setHeader === "function" &&
    typeof res.send === "function"
  );
}

// Helper function to detect Fastify
export function isFastify(req: any): req is FastifyRequest {
  return (
    typeof req === "object" &&
    req.server &&
    typeof req.server === "object" &&
    typeof req.raw === "object" &&
    typeof req.id !== "undefined"
  );
}

// Helper function to detect Hono
export function isHono(req: any): req is HonoContext {
  return (
    typeof req === "object" &&
    typeof req.header === "function" &&
    typeof req.res !== "undefined"
  );
}
