import { OSUtils } from "node-os-utils";
import { Status } from "../index.js";
import type { HealthCheck } from "./types.js";

const osu = new OSUtils();

export const cpuCheck = async (): Promise<HealthCheck> => {
  const start = Date.now();
  const usage = await osu.cpu.usage();

  if (!usage.success) {
    return {
      status: Status.fail,
      value: "N/A",
      componentName: "cpu",
      message: "CPU usage could not be read",
      time: Date.now() - start,
    };
  }

  const cpuUsage = usage.data;
  const ok = cpuUsage <= 80;

  return {
    status: ok ? Status.pass : Status.fail,
    value: `${cpuUsage.toFixed(2)}%`,
    componentName: "cpu",
    message: ok ? "CPU usage is below 80%" : "CPU usage is above 80%",
    time: Date.now() - start,
  };
};
