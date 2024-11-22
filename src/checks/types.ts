import { Status } from "../index.js";

export interface HealthCheck {
  status: Status;
  value: string;
  componentName: string;
  message: string;

  // Time in milliseconds
  time: number;
}

export interface CheckFn {
  (): Promise<any>
}

export interface CheckRegistry {
  [key: string]: CheckFn;
}
