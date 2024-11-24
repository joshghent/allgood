import { Status } from "../index.js";
import { HealthCheck } from "./types.js";
import osu from "node-os-utils";

export const cpuCheck = async (): Promise<HealthCheck> => {
  const start = Date.now();
  const cpu = osu.cpu
  const cpuUsage = await cpu.usage()

  return {
    status: cpuUsage > 80 ? Status.fail : Status.pass,
    value: `${cpuUsage.toFixed(2)}%`,
    componentName: "cpu",
    message: "CPU usage is below 80%",
    time: Date.now() - start,
  }
}
