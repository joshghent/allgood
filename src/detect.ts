import type { Request as ExpressRequest } from "express";
import type { FastifyRequest } from "fastify";
import type { Context as HonoContext } from "hono";

type Fields = Record<string, unknown>;

const isObject = (value: unknown): value is Fields => typeof value === "object" && value !== null;

// Helper function to detect Express
export function isExpress(req: unknown, res: unknown): req is ExpressRequest {
  return (
    isObject(req) &&
    isObject(res) &&
    typeof req.app !== "undefined" &&
    typeof req.headers !== "undefined" &&
    typeof res.setHeader === "function" &&
    typeof res.send === "function"
  );
}

// Helper function to detect Fastify
export function isFastify(req: unknown): req is FastifyRequest {
  return isObject(req) && isObject(req.server) && typeof req.raw === "object" && typeof req.id !== "undefined";
}

// Helper function to detect Hono
export function isHono(req: unknown): req is HonoContext {
  return isObject(req) && typeof req.header === "function" && typeof req.res !== "undefined";
}

// Helper function to detect a Fetch API Request (Next.js App Router, Bun, Deno...)
export function isWebRequest(req: unknown): req is Request {
  return typeof Request !== "undefined" && req instanceof Request;
}
