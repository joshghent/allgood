---
"@joshghent/allgood": minor
---

Next.js App Router support, and fixes for connection leaks.

- **Next.js (App Router) and any Fetch API framework.** `export const GET = createHealthCheck({...})` in a route handler; also works with Bun, Deno, Remix and SvelteKit.
- **The health check no longer leaks connections.** The database check built a new knex pool on every request and never closed it, so polling it slowly exhausted the database's connections. It now keeps one single-connection pool per connection string (close them with the new `closeDbClients()`). A failed Redis ping left its client reconnecting forever; the client is now always disconnected.
- **Returns 503 when a check fails** (was always 200), so monitors can alert on the status code.
- **The memory check measures against the V8 heap limit.** It divided by the heap V8 had reserved so far, which healthy apps routinely fill past 80%, so it failed on normal load.
- A warning that finished after a failure no longer reported the overall status as `warn`.
- Options from one `createHealthCheck` call no longer leak into later calls.
- `postgresql://` URLs are accepted as well as `postgres://`.
- README examples import from `@joshghent/allgood` (they said `allgood`), and an `llms.txt` ships in the package for coding agents.
