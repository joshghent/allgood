import { memoryCheck } from "./memory.js";
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
});
