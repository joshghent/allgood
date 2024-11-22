# Allgood
>


## Examples

### Basic
```js
import createHealthCheck from "allgood-middleware";

const healthCheck = createHealthCheck({
  db_connection_string: process.env.DATABASE_URL,
  cache_connection_string: process.env.REDIS_URL,
  checks: {
    db_connection: true,
    cache_connection: true,
    disk_space: true,
    memory_usage: true,
    outbound_internet: true,
  },
});
```

### Express
```js
import express from "express";
import createHealthCheck from "allgood-middleware";

const app = express();

const healthCheck = createHealthCheck();

app.get("/healthcheck", healthCheck);

app.listen(3000, () => {
  console.log("Express server running on http://localhost:3000");
});
```
