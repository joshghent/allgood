---
"@joshghent/allgood": patch
---

`createHealthCheck` returns a typed handler instead of one that takes `any`. It has an overload for Express, Fastify, Hono and the Fetch API (Next.js and others), so editors show the right types, and a call that matches no supported framework fails at compile time instead of throwing at runtime.
