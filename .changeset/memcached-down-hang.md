---
"@joshghent/allgood": patch
---

The cache check always answers within 5 seconds and closes its connection.

- **Memcached down:** the check used to wait on the client's retries, 5 of them 30 seconds apart. It now fails at once.
- **A server that accepts the connection and never replies** (a stuck server, or the wrong port) used to hang the health check for good, on both Redis and Memcached. It now fails after 5 seconds.
- **The `memcached` package is gone.** The check sends `version` over a plain socket, so nothing reconnects in the background and no socket outlives the check.
