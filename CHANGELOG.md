# @joshghent/allgood

## 1.1.0

### Minor Changes

- 9b6268b: Next.js App Router support, and fixes for connection leaks.
  
  - **Next.js (App Router) and any Fetch API framework.** `export const GET = createHealthCheck({...})` in a route handler; also works with Bun, Deno, Remix and SvelteKit.
  - **The health check no longer leaks connections.** The database check built a new knex pool on every request and never closed it, so polling it slowly exhausted the database's connections. It now keeps one single-connection pool per connection string (close them with the new `closeDbClients()`). A failed Redis ping left its client reconnecting forever; the client is now always disconnected.
  - **Returns 503 when a check fails** (was always 200), so monitors can alert on the status code.
  - **The memory check measures against the V8 heap limit.** It divided by the heap V8 had reserved so far, which healthy apps routinely fill past 80%, so it failed on normal load.
  - A warning that finished after a failure no longer reported the overall status as `warn`.
  - Options from one `createHealthCheck` call no longer leak into later calls.
  - `postgresql://` URLs are accepted as well as `postgres://`.
  - README examples import from `@joshghent/allgood` (they said `allgood`), and an `llms.txt` ships in the package for coding agents.

### Patch Changes

- bc5cdbf: Security patches, fewer dependencies, and a correct CPU message.
  
  - **Security.** hono, fastify, mysql2 and their transitive packages move to patched releases.
  - **Three fewer native installs.** `redis`, `oracledb` and `sqlite3` were listed as dependencies but never used, so they no longer install with allgood.
  - **The CPU check says when usage is high.** A failing check reported "CPU usage is below 80%". It now says "CPU usage is above 80%", and fails with "CPU usage could not be read" when the reading itself fails.
  - ioredis 6 and node-os-utils 3.
- baa29ad: The cache check always answers within 5 seconds and closes its connection.
  
  - **Memcached down:** the check used to wait on the client's retries, 5 of them 30 seconds apart. It now fails at once.
  - **A server that accepts the connection and never replies** (a stuck server, or the wrong port) used to hang the health check for good, on both Redis and Memcached. It now fails after 5 seconds.
  - **The `memcached` package is gone.** The check sends `version` over a plain socket, so nothing reconnects in the background and no socket outlives the check.
- dac065d: `createHealthCheck` returns a typed handler instead of one that takes `any`. It has an overload for Express, Fastify, Hono and the Fetch API (Next.js and others), so editors show the right types, and a call that matches no supported framework fails at compile time instead of throwing at runtime.

## 1.0.1

### Patch Changes

- 76edd7f: added test suite
