import { HealthCheck } from "./types.js";
import diskusage from "diskusage";
import os from "os";
import { Status } from "../index.js";

const getDiskSpace = async () => {
  let path = os.platform() === 'win32' ? 'c:' : '/';
  const usage = await diskusage.check(path);
  return usage.free;
}

export const disk = async(): Promise<HealthCheck> => {
  const start = Date.now();
  const diskSpace = await getDiskSpace();
  const result = diskSpace > 1000000000;

  return {
    status: result ? Status.pass : Status.fail,
    value: `${(diskSpace / (1024 * 1024 * 1024)).toFixed(2)} GB`,
    componentName: "disk",
    message: result ? "Disk space is greater than 1GB" : "Disk space is less than 1GB",
    time: Date.now() - start,
  }
}
