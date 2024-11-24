import { Context } from "hono";
import { healthcheckHandler } from "../healthcheck.js";
import type { Config } from "../index.js";

export async function honoHealthCheck(
  c: Context,
  config: Config
): Promise<Response> {
  const normalizedHeaders: Record<string, string | undefined> = {};

  // Convert each header to the correct type
  Object.entries(c.req.header()).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // If the header value is an array, take the first element
      normalizedHeaders[key] = value[0];
    } else {
      // Otherwise, directly assign the string or undefined value
      normalizedHeaders[key] = value;
    }
  });

  const { type, body } = await healthcheckHandler(normalizedHeaders, config);

  c.header("Content-Type", type);
  return c.body(body);
}
