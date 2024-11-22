import { disk } from "./disk.js";

describe("memoryCheck", () => {
  it("returns a valid health check result", async () => {
    const result = await disk();

    expect(typeof result.status).toBe("string");
    expect(typeof result.value).toBe("string");
    expect(result.componentName).toBe("disk");
    expect(typeof result.message).toBe("string");
    expect(typeof result.time).toBe("number");
  });
});
