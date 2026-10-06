import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import Fastify from "fastify";
import { Hono } from "hono";
import { closeDbClients, createHealthCheck } from "../../src/index.js";

// A real database and cache, so each framework serves a full response.
const config = {
  db_connection: "postgres://allgood:allgood@localhost:54329/allgood",
  cache_connection: "redis://localhost:63799",
  checks: {
    db_connection: true,
    cache_connection: true,
    disk_space: false,
    memory_usage: false,
    outbound_internet: false,
    cpu_usage: false,
  },
};

const failing = { ...config, cache_connection: "redis://localhost:1" };

afterAll(async () => {
  await closeDbClients();
});

const expectHealthy = async (res: Response) => {
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toMatch(/^application\/json/);
  const body = await res.json();
  expect(body.status).toBe("pass");
  expect(Object.keys(body.results).sort()).toEqual(["cache_connection", "db_connection"]);
};

describe("Express", () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    const app = express();
    app.get("/health", createHealthCheck(config));
    app.get("/down", createHealthCheck(failing));
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    base = `http://localhost:${(server.address() as AddressInfo).port}`;
  });

  // fetch keeps its sockets alive, and close() waits for them.
  afterAll(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );

  it("serves a passing JSON health check", async () => {
    await expectHealthy(await fetch(`${base}/health`));
  });

  it("serves the HTML page to a browser", async () => {
    const res = await fetch(`${base}/health`, { headers: { accept: "text/html" } });

    expect(res.headers.get("content-type")).toMatch(/^text\/html/);
    expect(await res.text()).toContain("It's All Good");
  });

  it("returns 503 when a check fails", async () => {
    expect((await fetch(`${base}/down`)).status).toBe(503);
  });
});

describe("Fastify", () => {
  const app = Fastify();
  let base: string;

  beforeAll(async () => {
    app.get("/health", createHealthCheck(config));
    app.get("/down", createHealthCheck(failing));
    base = await app.listen({ port: 0, host: "127.0.0.1" });
  });

  afterAll(() => app.close());

  it("serves a passing JSON health check", async () => {
    await expectHealthy(await fetch(`${base}/health`));
  });

  it("returns 503 when a check fails", async () => {
    expect((await fetch(`${base}/down`)).status).toBe(503);
  });
});

describe("Hono", () => {
  const app = new Hono();
  app.get("/health", createHealthCheck(config));
  app.get("/down", createHealthCheck(failing));

  it("serves a passing JSON health check", async () => {
    await expectHealthy(await app.request("/health"));
  });

  it("returns 503 when a check fails", async () => {
    expect((await app.request("/down")).status).toBe(503);
  });
});
