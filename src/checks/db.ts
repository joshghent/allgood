import pkg from "pg-connection-string";
const { parse } = pkg;
import { Config, Status } from "../index.js";
import { HealthCheck } from "./types.js";
import knex, { type Knex } from "knex";

/**
 * One pool per connection string, kept for the life of the process.
 *
 * This used to build a new knex instance on every request and never destroy
 * it, so each health check left an open pool behind. Polled once a minute,
 * that slowly used up the database's connection limit — the health check
 * became the outage. A single-connection pool is all a `SELECT 1` needs.
 */
const clients = new Map<string, Knex>();

/** Closes every pool this module opened. For graceful shutdown, and tests. */
export const closeDbClients = async () => {
  const open = [...clients.values()];
  clients.clear();
  await Promise.all(open.map((c) => c.destroy()));
};

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
      case "postgresql":
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
    let dbClient = clients.get(config.db_connection);
    if (!dbClient) {
      dbClient = knex({
        client,
        connection: {
          host,
          port: port ? parseInt(port, 10) : undefined,
          user,
          password,
          database,
        },
        pool: { min: 0, max: 1 },
        // Fail the check rather than hang the request when the database is
        // unreachable. knex's default waits 60s for a connection.
        acquireConnectionTimeout: 5000,
      });
      clients.set(config.db_connection, dbClient);
    }

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
