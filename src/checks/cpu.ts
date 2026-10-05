import { Status } from "../index.js";
import { HealthCheck } from "./types.js";
import osu from "node-os-utils";

export const cpuCheck = async (): Promise<HealthCheck> => {
  const start = Date.now();
  const cpu = osu.cpu
  const cpuUsage = await cpu.usage()
  const ok = cpuUsage <= 80

  return {
    status: ok ? Status.pass : Status.fail,
    value: `${cpuUsage.toFixed(2)}%`,
    componentName: "cpu",
    message: ok ? "CPU usage is below 80%" : "CPU usage is above 80%",
    time: Date.now() - start,
  }
}
