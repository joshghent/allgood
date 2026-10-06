import { Status } from "../index.js";
import { cpuCheck } from "./cpu.js";

const mockUsage = jest.fn();

jest.mock("node-os-utils", () => ({
  OSUtils: jest.fn(() => ({ cpu: { usage: () => mockUsage() } })),
}));

const reading = (data: number) => ({ success: true, data, timestamp: 0, cached: false, platform: "linux" });

describe("cpuCheck", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return pass status when CPU usage is below 80%", async () => {
    mockUsage.mockResolvedValue(reading(45));

    const result = await cpuCheck();

    expect(result).toMatchObject({
      status: Status.pass,
      value: "45.00%",
      componentName: "cpu",
      message: "CPU usage is below 80%",
    });
    expect(result.time).toBeGreaterThanOrEqual(0);
  });

  it("should return fail status when CPU usage is above 80%", async () => {
    mockUsage.mockResolvedValue(reading(85));

    const result = await cpuCheck();

    expect(result).toMatchObject({
      status: Status.fail,
      value: "85.00%",
      componentName: "cpu",
      message: "CPU usage is above 80%",
    });
    expect(result.time).toBeGreaterThanOrEqual(0);
  });

  it("should handle edge case of exactly 80%", async () => {
    mockUsage.mockResolvedValue(reading(80));

    const result = await cpuCheck();

    expect(result).toMatchObject({
      status: Status.pass,
      value: "80.00%",
      componentName: "cpu",
      message: "CPU usage is below 80%",
    });
  });

  it("should return fail status when CPU usage cannot be read", async () => {
    mockUsage.mockResolvedValue({
      success: false,
      error: { code: "COMMAND_FAILED", message: "top failed" },
      platform: "linux",
      timestamp: 0,
    });

    const result = await cpuCheck();

    expect(result).toMatchObject({
      status: Status.fail,
      value: "N/A",
      componentName: "cpu",
      message: "CPU usage could not be read",
    });
  });
});
