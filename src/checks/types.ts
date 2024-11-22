import { Status } from "../index.js";

export interface HealthCheck {
  status: Status;
  value: string;
  componentType: string;
}

export interface CheckFn {
  (): Promise<any>
}

export interface CheckRegistry {
  [key: string]: CheckFn;
}
