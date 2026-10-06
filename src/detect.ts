import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Context as HonoContext } from "hono";

type Fields = Record<string, unknown>;

const isObject = (value: unknown): value is Fields => typeof value === "object" && value !== null;

// Helper functions to detect Express
export function isExpress(req: unknown): req is ExpressRequest {
  return isObject(req) && typeof req.app !== "undefined" && typeof req.headers !== "undefined";
}

export function isExpressResponse(res: unknown): res is ExpressResponse {
  return isObject(res) && typeof res.setHeader === "function" && typeof res.send === "function";
}

// Helper functions to detect Fastify
export function isFastify(req: unknown): req is FastifyRequest {
  return isObject(req) && isObject(req.server) && typeof req.raw === "object" && typeof req.id !== "undefined";
}

export function isFastifyReply(reply: unknown): reply is FastifyReply {
  return isObject(reply) && typeof reply.code === "function" && typeof reply.send === "function";
}

// Helper function to detect Hono
export function isHono(req: unknown): req is HonoContext {
  return isObject(req) && typeof req.header === "function" && typeof req.res !== "undefined";
}

// Helper function to detect a Fetch API Request (Next.js App Router, Bun, Deno...)
export function isWebRequest(req: unknown): req is Request {
  return typeof Request !== "undefined" && req instanceof Request;
}
