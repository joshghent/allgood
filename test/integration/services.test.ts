import { once } from "node:events";
import net, { type AddressInfo } from "node:net";
import { closeDbClients, createHealthCheck } from "../../src/index.js";

// Ports from compose.yaml, which CI mirrors.
const POSTGRES = "postgres://allgood:allgood@localhost:54329/allgood";
const MYSQL = "mysql://allgood:allgood@localhost:33069/allgood";
const REDIS = "redis://localhost:63799";
const MEMCACHED = "memcached://localhost:11219";

// Nothing listens here.
const CLOSED_PORT = 1;

const only = (checks: Record<string, boolean>) => ({
  checks: {
    disk_space: false,
    memory_usage: false,
    outbound_internet: false,
    cpu_usage: false,
    ...checks,
  },
});

const check = async (config: Parameters<typeof createHealthCheck>[0]) => {
  const res = (await createHealthCheck(config)(new Request("http://localhost/health"), undefined)) as Response;
  return { status: res.status, body: await res.json() };
};

afterAll(async () => {
  await closeDbClients();
});

describe.each([
  ["postgres", POSTGRES],
  ["mysql", MYSQL],
])("db_connection against %s", (_, url) => {
  it("passes", async () => {
    const { status, body } = await check({ db_connection: url, ...only({ db_connection: true }) });

    expect(status).toBe(200);
    expect(body.results.db_connection).toMatchObject({ status: "pass", message: "Database connection successful" });
  });

  it("reuses one pool across requests", async () => {
    const config = { db_connection: url, ...only({ db_connection: true }) };

    for (let i = 0; i < 5; i++) {
      expect((await check(config)).status).toBe(200);
    }
  });
});

describe("db_connection with nothing listening", () => {
  it("fails with a 503 well inside the 5s acquire timeout", async () => {
    const started = Date.now();
    const { status, body } = await check({
      db_connection: `postgres://allgood:allgood@localhost:${CLOSED_PORT}/allgood`,
      ...only({ db_connection: true }),
    });

    expect(status).toBe(503);
    expect(body.results.db_connection.status).toBe("fail");
    expect(Date.now() - started).toBeLessThan(6000);
  });
});

describe.each([
  ["redis", REDIS, `redis://localhost:${CLOSED_PORT}`],
  ["memcached", MEMCACHED, `memcached://localhost:${CLOSED_PORT}`],
])("cache_connection against %s", (_, url, downUrl) => {
  it("passes", async () => {
    const { status, body } = await check({ cache_connection: url, ...only({ cache_connection: true }) });

    expect(status).toBe(200);
    expect(body.results.cache_connection).toMatchObject({ status: "pass", message: "Cache connection successful" });
  });

  it("fails with a 503 when nothing is listening", async () => {
    const { status, body } = await check({ cache_connection: downUrl, ...only({ cache_connection: true }) });

    expect(status).toBe(503);
    expect(body.results.cache_connection.status).toBe("fail");
  });

  it("fails inside 5s and closes its socket when the server never replies", async () => {
    // Accepts the connection, then says nothing: a stuck server, or the wrong port.
    // It reads, or it would never see the client close and its own socket would count.
    const silent = net.createServer((s) => s.resume()).listen(0, "127.0.0.1");
    await once(silent, "listening");
    const port = (silent.address() as AddressInfo).port;
    const sockets = () => process.getActiveResourcesInfo().filter((r) => r === "TCPSocketWrap").length;
    const before = sockets();

    const started = Date.now();
    const { status } = await check({
      cache_connection: `${new URL(url).protocol}//127.0.0.1:${port}`,
      ...only({ cache_connection: true }),
    });
    const took = Date.now() - started;
    await new Promise((resolve) => setTimeout(resolve, 100));
    const leftover = sockets() - before;
    silent.close();

    expect(status).toBe(503);
    expect(took).toBeLessThan(6000);
    expect(leftover).toBeLessThanOrEqual(0);
  });
});

describe("the default checks on this machine", () => {
  it("reads real disk, memory and CPU figures", async () => {
    const { body } = await check(only({ disk_space: true, memory_usage: true, cpu_usage: true }));

    expect(body.results.disk_space.value).toMatch(/^\d+\.\d{2} GB$/);
    expect(body.results.memory_usage.value).toMatch(/^\d+\.\d{2}%$/);
    expect(body.results.cpu_usage.value).toMatch(/^\d+\.\d{2}%$/);
  });
});
