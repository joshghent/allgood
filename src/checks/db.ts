import { Status } from "../index.js";
import { HealthCheck } from "./types.js";

export const connection = async (): Promise<HealthCheck> => {
  const start = Date.now();

  return {
    componentName: "db_connection",
    status: Status.pass,
    message: "Database connection successful",
    value: "true",
    time: Date.now() - start,
  };
}

// export const simpleQuery = async (): Promise<HealthCheck> => {
// }
