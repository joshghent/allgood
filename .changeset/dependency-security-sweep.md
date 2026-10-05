---
"@joshghent/allgood": patch
---

Security patches, fewer dependencies, and a correct CPU message.

- **Security.** hono, fastify, mysql2 and their transitive packages move to patched releases.
- **Three fewer native installs.** `redis`, `oracledb` and `sqlite3` were listed as dependencies but never used, so they no longer install with allgood.
- **The CPU check says when usage is high.** A failing check reported "CPU usage is below 80%". It now says "CPU usage is above 80%", and fails with "CPU usage could not be read" when the reading itself fails.
- ioredis 6 and node-os-utils 3.
