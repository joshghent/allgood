import { closeDbClients, dbConnection } from './db.js';
import { Status } from '../index.js';
import knex from 'knex';

// Mock knex
jest.mock('knex');

describe('dbConnection', () => {
  // Reset mocks before each test
  beforeEach(async () => {
    await closeDbClients();
    jest.clearAllMocks();
    (knex as unknown as jest.Mock).mockReturnValue({
      raw: jest.fn(),
      destroy: jest.fn(),
    });
  });

  it('should return fail status when no connection string is provided', async () => {
    const result = await dbConnection({ db_connection: '', checks: { db_connection: true } });

    expect(result).toEqual({
      componentName: 'db_connection',
      status: Status.fail,
      message: 'No database connection string provided',
      value: 'false',
      time: expect.any(Number),
    });
  });

  it('should return fail status when connection string is invalid', async () => {
    const result = await dbConnection({ db_connection: 'invalid://connection', checks: { db_connection: true } });

    expect(result).toEqual({
      componentName: 'db_connection',
      status: Status.fail,
      message: 'Invalid database connection string',
      value: 'false',
      time: expect.any(Number),
    });
  });

  it('should throw error for unsupported database protocol', async () => {
    await expect(
      dbConnection({ db_connection: 'unsupported://localhost:5432/db', checks: { db_connection: true } })
    ).rejects.toThrow('Unsupported protocol: unsupported');
  });

  it('should return pass status for successful postgres connection', async () => {
    const mockRaw = jest.fn().mockResolvedValue(true);
    (knex as unknown as jest.Mock).mockReturnValue({
      raw: mockRaw,
      destroy: jest.fn(),
    });

    const result = await dbConnection({
      db_connection: 'postgres://user:pass@localhost:5432/db',
      checks: { db_connection: true }
    });

    expect(knex).toHaveBeenCalledWith(expect.objectContaining({
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'user',
        password: 'pass',
        database: 'db',
      },
      pool: { min: 0, max: 1 },
    }));

    expect(result).toEqual({
      componentName: 'db_connection',
      status: Status.pass,
      message: 'Database connection successful',
      value: 'true',
      time: expect.any(Number),
    });
  });

  it('should return fail status when database connection fails', async () => {
    const mockRaw = jest.fn().mockRejectedValue(new Error('Connection failed'));
    (knex as unknown as jest.Mock).mockReturnValue({
      raw: mockRaw,
      destroy: jest.fn(),
    });

    const result = await dbConnection({
      db_connection: 'postgres://user:pass@localhost:5432/db',
      checks: { db_connection: true }
    });

    expect(result).toEqual({
      componentName: 'db_connection',
      status: Status.fail,
      message: 'Database connection failed',
      value: 'false',
      time: expect.any(Number),
    });
  });

  it('should handle mysql connections correctly', async () => {
    const mockRaw = jest.fn().mockResolvedValue(true);
    (knex as unknown as jest.Mock).mockReturnValue({
      raw: mockRaw,
      destroy: jest.fn(),
    });

    const result = await dbConnection({
      db_connection: 'mysql://user:pass@localhost:3306/db',
      checks: { db_connection: true }
    });

    expect(knex).toHaveBeenCalledWith(expect.objectContaining({
      client: 'mysql2',
      connection: expect.any(Object),
    }));
    expect(result.status).toBe(Status.pass);
  });

  it('reuses one pool across checks instead of opening a new one each time', async () => {
    const mockRaw = jest.fn().mockResolvedValue(true);
    (knex as unknown as jest.Mock).mockReturnValue({ raw: mockRaw, destroy: jest.fn() });
    const config = { db_connection: 'postgres://user:pass@localhost:5432/db', checks: { db_connection: true } };

    await dbConnection(config);
    await dbConnection(config);
    await dbConnection(config);

    expect(knex).toHaveBeenCalledTimes(1);
    expect(mockRaw).toHaveBeenCalledTimes(3);
  });

  it('accepts the postgresql:// scheme as well as postgres://', async () => {
    const result = await dbConnection({
      db_connection: 'postgresql://user:pass@localhost:5432/db',
      checks: { db_connection: true },
    });

    expect(knex).toHaveBeenCalledWith(expect.objectContaining({ client: 'pg' }));
    expect(result.status).toBe(Status.pass);
  });

  it('closes every pool it opened', async () => {
    const destroy = jest.fn();
    (knex as unknown as jest.Mock).mockReturnValue({ raw: jest.fn(), destroy });

    await dbConnection({ db_connection: 'postgres://u:p@a:5432/db', checks: { db_connection: true } });
    await dbConnection({ db_connection: 'postgres://u:p@b:5432/db', checks: { db_connection: true } });
    await closeDbClients();

    expect(destroy).toHaveBeenCalledTimes(2);
  });
});
