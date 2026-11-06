import { cpuCheck } from "./checks/cpu.js";
import { memoryCheck } from "./checks/memory.js";
import { createHealthCheck, Status } from "./index.js";

jest.mock("./checks/memory.js", () => ({ memoryCheck: jest.fn() }));
jest.mock("./checks/cpu.js", () => ({ cpuCheck: jest.fn() }));

const result = (status: Status) => ({ status, value: "", componentName: "x", message: "", time: 0 });

// Only the two mocked checks, so no test touches the real machine or network.
const config = {
  checks: {
    memory_usage: true,
    cpu_usage: true,
    disk_space: false,
    outbound_internet: false,
  },
};

describe("createHealthCheck with a Fetch API Request (Next.js App Router)", () => {
  beforeEach(() => {
    (memoryCheck as jest.Mock).mockResolvedValue(result(Status.pass));
    (cpuCheck as jest.Mock).mockResolvedValue(result(Status.pass));
  });

  it("returns a 200 JSON Response when every check passes", async () => {
    // Next calls GET(request, context) — the second argument is its route context.
    const res = await createHealthCheck(config)(new Request("http://localhost/api/health"), {
      params: {},
    });

    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect((await res.json()).status).toBe("pass");
  });

  it("returns 503 when a check fails", async () => {
    (cpuCheck as jest.Mock).mockResolvedValue(result(Status.fail));

    const res = await createHealthCheck(config)(new Request("http://localhost/api/health"), undefined);

    expect(res.status).toBe(503);
    expect((await res.json()).status).toBe("fail");
  });

  it("reports fail even when a warning finishes after the failure", async () => {
    (memoryCheck as jest.Mock).mockResolvedValue(result(Status.fail));
    (cpuCheck as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(result(Status.warn)), 10)),
    );

    const res = await createHealthCheck(config)(new Request("http://localhost/api/health"), undefined);

    expect((await res.json()).status).toBe("fail");
  });

  it("serves the HTML page to a browser", async () => {
    const req = new Request("http://localhost/api/health", { headers: { accept: "text/html" } });

    const res = await createHealthCheck(config)(req, undefined);

    expect(res.headers.get("content-type")).toBe("text/html");
    expect(await res.text()).toContain("It's All Good");
  });
});

describe("createHealthCheck with a secret", () => {
  const request = (headers: Record<string, string> = {}) =>
    new Request("http://localhost/health", { headers: { accept: "application/json", ...headers } });

  beforeEach(() => {
    (memoryCheck as jest.Mock).mockResolvedValue({ ...result(Status.pass), value: "41.20%" });
    (cpuCheck as jest.Mock).mockResolvedValue({ ...result(Status.pass), value: "12.00%" });
  });

  it("hides system values from a request without the secret", async () => {
    const body = await (await createHealthCheck({ ...config, secret: "s3cret" })(request())).json();

    expect(body.status).toBe(Status.pass);
    expect(body.results.memory_usage.value).toBe("hidden");
    expect(body.results.cpu_usage.value).toBe("hidden");
  });

  it("hides them from a request with the wrong secret", async () => {
    const res = await createHealthCheck({ ...config, secret: "s3cret" })(request({ "x-allgood-secret": "guess" }));

    expect((await res.json()).results.memory_usage.value).toBe("hidden");
  });

  it("shows them to a request with the secret", async () => {
    const res = await createHealthCheck({ ...config, secret: "s3cret" })(request({ "x-allgood-secret": "s3cret" }));
    const body = await res.json();

    expect(body.results.memory_usage.value).toBe("41.20%");
    expect(body.results.cpu_usage.value).toBe("12.00%");
  });

  it("shows them when no secret is configured", async () => {
    const body = await (await createHealthCheck(config)(request())).json();

    expect(body.results.memory_usage.value).toBe("41.20%");
  });
});

describe("createHealthCheck config", () => {
  it("does not leak one call's options into the next", async () => {
    createHealthCheck({ checks: { db_connection: true } });
    (memoryCheck as jest.Mock).mockResolvedValue(result(Status.pass));
    (cpuCheck as jest.Mock).mockResolvedValue(result(Status.pass));

    const res = await createHealthCheck(config)(new Request("http://localhost/api/health"), undefined);

    // db_connection would fail here (no connection string) if the first call's
    // config had been merged into the shared defaults.
    expect(Object.keys((await res.json()).results).sort()).toEqual(["cpu_usage", "memory_usage"]);
  });
});
