import pkg from "pg-connection-string";
const { parse } = pkg;
import { Config, Status } from "../index.js";
import { HealthCheck } from "./types.js";
import knex from "knex";

export const dbConnection = async (config: Config): Promise<HealthCheck> => {
  const start = Date.now();

  if (!config.db_connection) {
    return {
      componentName: "db_connection",
      status: Status.fail,
      message: "No database connection string provided",
      value: "false",
      time: Date.now() - start,
    };
  }
  const { host, port, database, user, password } = parse(config.db_connection);

  if (!host || !database) {
    return {
      componentName: "db_connection",
      status: Status.fail,
      message: "Invalid database connection string",
      value: "false",
      time: Date.now() - start,
    };
  }

  const protocol = config.db_connection.split(":")[0];
  const client = (() => {
    switch (protocol) {
      case "postgres":
        return 'pg'
      case "mysql":
      case 'mariadb':
        return 'mysql2'
      case 'mongodb':
      case 'mongodb+srv':
        return 'mongodb'
      case 'mssql':
        return 'mssql'
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }
  })();

  try {
    const dbClient = knex({
      client,
      connection: {
        host,
        port: port ? parseInt(port, 10) : undefined,
        user,
        password,
        database,
      },
    });

    await dbClient.raw("SELECT 1");

    return {
      componentName: "db_connection",
      status: Status.pass,
      message: "Database connection successful",
      value: "true",
      time: Date.now() - start,
    };
  } catch (error) {
    console.error(error);
    return {
      componentName: "db_connection",
      status: Status.fail,
      message: "Database connection failed",
      value: "false",
      time: Date.now() - start,
    };
  }
}
