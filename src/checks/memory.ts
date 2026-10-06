import { getHeapStatistics } from "node:v8";
import { Status } from "../index.js";
import type { HealthCheck } from "./types.js";

/**
 * Heap used as a share of the most V8 will ever let it grow to.
 *
 * Not `heapUsed / heapTotal`: heapTotal is what V8 has reserved so far, and it
 * only grows when it has to, so a healthy process routinely sits at 80–95% of
 * it. Measured that way this check failed on ordinary apps, which with a 503
 * on failure would page someone for nothing.
 */
export const memoryCheck = async (): Promise<HealthCheck> => {
  const start = Date.now();
  const { used_heap_size, heap_size_limit } = getHeapStatistics();
  const heapUsedPercentage = (used_heap_size / heap_size_limit) * 100;
  const ok = heapUsedPercentage <= 80;

  return {
    status: ok ? Status.pass : Status.fail,
    value: `${heapUsedPercentage.toFixed(2)}%`,
    componentName: "memory",
    message: ok ? "Memory usage is below 80%" : "Memory usage is above 80%",
    time: Date.now() - start,
  };
};
