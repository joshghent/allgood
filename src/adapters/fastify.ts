import { type FastifyRequest, type FastifyReply } from "fastify";
import { healthcheckHandler } from "../healthcheck.js";
import type { Config } from "../index.js";

export async function fastifyHealthCheck(
  req: FastifyRequest,
  reply: FastifyReply,
  config: Config
) {
  const normalizedHeaders: Record<string, string | undefined> = {};

  // Convert each header to the correct type
  Object.entries(req.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // If the header value is an array, take the first element
      normalizedHeaders[key] = value[0];
    } else {
      // Otherwise, directly assign the string or undefined value
      normalizedHeaders[key] = value;
    }
  });

  const { type, body } = await healthcheckHandler(normalizedHeaders, config);

  reply.header("Content-Type", type);
  reply.send(body);
}
