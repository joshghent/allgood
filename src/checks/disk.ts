import os from "node:os";
import diskusage from "diskusage";
import { Status } from "../index.js";
import type { HealthCheck } from "./types.js";

const getDiskSpace = async () => {
  const path = os.platform() === "win32" ? "c:" : "/";
  const usage = await diskusage.check(path);
  return usage.free;
};

export const disk = async (): Promise<HealthCheck> => {
  const start = Date.now();
  const diskSpace = await getDiskSpace();
  const result = diskSpace > 1000000000;

  return {
    status: result ? Status.pass : Status.fail,
    value: `${(diskSpace / (1024 * 1024 * 1024)).toFixed(2)} GB`,
    componentName: "disk",
    message: result ? "Disk space is greater than 1GB" : "Disk space is less than 1GB",
    time: Date.now() - start,
  };
};
