---
"@joshghent/allgood": minor
---

Add a `secret` option that hides CPU, memory and disk values unless the request sends it in the `x-allgood-secret` header, and report a database connection timeout as `timeout` instead of a generic failure.
