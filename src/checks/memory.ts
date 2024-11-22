import { Status } from "../index.js";

export const memoryCheck = async () => {
  const used = process.memoryUsage();
  const heapUsedPercentage = (used.heapUsed / used.heapTotal) * 100;

  return {
    status: heapUsedPercentage > 80 ? Status.fail : Status.pass,
    value: `${heapUsedPercentage.toFixed(2)}%`,
    componentType: "memory",
  };
}
