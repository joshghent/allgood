import { healthcheckHandler } from "../healthcheck.js";
import type { Config } from "../index.js";

/**
 * Any framework built on the Fetch API's Request/Response: Next.js App Router
 * route handlers, Remix/React Router loaders, Bun.serve, Deno and SvelteKit
 * endpoints all hand over a standard `Request` and take a `Response` back.
 */
export async function webHealthCheck(req: Request, config: Config): Promise<Response> {
  const headers: Record<string, string | undefined> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const { statusCode, type, body } = await healthcheckHandler(headers, config);

  return new Response(body, {
    status: statusCode,
    headers: {
      "Content-Type": type,
      // A cached health check reports on a moment that has passed.
      "Cache-Control": "no-store",
    },
  });
}
