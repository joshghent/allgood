import { Status } from "../index.js";
import { HealthCheck } from "./types.js";

export const memoryCheck = async (): Promise<HealthCheck> => {
  const start = Date.now();
  const used = process.memoryUsage();
  const heapUsedPercentage = (used.heapUsed / used.heapTotal) * 100;

  return {
    status: heapUsedPercentage > 80 ? Status.fail : Status.pass,
    value: `${heapUsedPercentage.toFixed(2)}%`,
    componentName: "memory",
    message: "Memory usage is below 80%",
    time: Date.now() - start,
  };
}
