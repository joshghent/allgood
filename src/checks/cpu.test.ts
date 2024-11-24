import { cpuCheck } from './cpu.js';
import { Status } from '../index.js';
import osu from 'node-os-utils';

jest.mock('node-os-utils', () => ({
  cpu: {
    usage: jest.fn()
  }
}));

describe('cpuCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return pass status when CPU usage is below 80%', async () => {
    (osu.cpu.usage as jest.Mock).mockResolvedValue(45);

    const result = await cpuCheck();

    expect(result).toMatchObject({
      status: Status.pass,
      value: '45.00%',
      componentName: 'cpu',
      message: 'CPU usage is below 80%'
    });
    expect(result.time).toBeGreaterThanOrEqual(0);
  });

  it('should return fail status when CPU usage is above 80%', async () => {
    (osu.cpu.usage as jest.Mock).mockResolvedValue(85);

    const result = await cpuCheck();

    expect(result).toMatchObject({
      status: Status.fail,
      value: '85.00%',
      componentName: 'cpu',
      message: 'CPU usage is below 80%'
    });
    expect(result.time).toBeGreaterThanOrEqual(0);
  });

  it('should handle edge case of exactly 80%', async () => {
    (osu.cpu.usage as jest.Mock).mockResolvedValue(80);

    const result = await cpuCheck();

    expect(result).toMatchObject({
      status: Status.pass,
      value: '80.00%',
      componentName: 'cpu',
      message: 'CPU usage is below 80%'
    });
  });
});
