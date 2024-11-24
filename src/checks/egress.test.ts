
import { Status } from "../index.js";
import { egress } from "./egress.js";

describe("memoryCheck", () => {
  it("returns a valid health check result", async () => {
    const result = await egress();

    expect(typeof result.status).toBe("string");
    expect(typeof result.value).toBe("string");
    expect(result.componentName).toBe("egress");
    expect(typeof result.message).toBe("string");
    expect(typeof result.time).toBe("number");
  });

  it("calls fetch with the correct URLs", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await egress();
    expect(global.fetch).toHaveBeenCalledWith("https://1.1.1.1");
  });

  it("fails over to the next URL if the first one fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Test error"));
    const result = await egress();
    expect(global.fetch).toHaveBeenCalledWith("https://8.8.8.8");
    expect(result.status).toBe(Status.fail);
  });
});
