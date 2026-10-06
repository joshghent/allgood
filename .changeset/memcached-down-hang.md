---
"@joshghent/allgood": patch
---

The cache check no longer hangs when Memcached is down. It used the client's defaults, which retried 5 times 30 seconds apart, so the whole health check waited. It now fails at once and stops the client reconnecting afterwards.
