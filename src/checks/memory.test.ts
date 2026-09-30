import { memoryCheck } from "./memory.js";
import { getHeapStatistics } from "node:v8";

jest.mock("node:v8", () => {
  const actual = jest.requireActual("node:v8");
  return { getHeapStatistics: jest.fn(() => actual.getHeapStatistics()) };
});

const heap = (used: number, limit: number) =>
  (getHeapStatistics as jest.Mock).mockReturnValueOnce({ used_heap_size: used, heap_size_limit: limit });
import { Status } from "../index.js";

describe("memoryCheck", () => {
  it("returns a valid health check result", async () => {
    const result = await memoryCheck();

    expect(typeof result.status).toBe("string");
    expect(typeof result.value).toBe("string");
    expect(result.componentName).toBe("memory");
    expect(typeof result.message).toBe("string");
    expect(typeof result.time).toBe("number");
  });

  it("returns correct status based on heap usage", async () => {
    const result = await memoryCheck();
    const heapPercentage = parseFloat(result.value);

    if (heapPercentage > 80) {
      expect(result.status).toBe(Status.fail);
    } else {
      expect(result.status).toBe(Status.pass);
    }
  });

  it("returns heap usage as percentage string", async () => {
    const result = await memoryCheck();
    const percentageRegex = /^\d+\.\d{2}%$/;

    expect(result.value).toMatch(percentageRegex);
  });

  it("includes execution time", async () => {
    const result = await memoryCheck();

    expect(result.time).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result.time)).toBe(true);
  });

  it("measures against the heap limit, not the heap V8 has reserved so far", async () => {
    // Could be 90% of what V8 has reserved, but it is a sliver of the limit.
    heap(90, 4000);

    const result = await memoryCheck();

    expect(result.status).toBe(Status.pass);
    expect(result.value).toBe("2.25%");
  });

  it("fails and says so above 80% of the limit", async () => {
    heap(3500, 4000);

    const result = await memoryCheck();

    expect(result.status).toBe(Status.fail);
    expect(result.message).toBe("Memory usage is above 80%");
  });
});
