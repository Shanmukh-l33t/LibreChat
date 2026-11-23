import { runTeardown } from './helpers/mongoTeardown';

describe('runTeardown', () => {
  it('still stops the server when disconnect rejects', async () => {
    const stop = jest.fn().mockResolvedValue(undefined);

    await expect(
      runTeardown(
        () => Promise.reject(new Error('disconnect failed')),
        () => stop(),
      ),
    ).rejects.toThrow('disconnect failed');

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('reports every failed step and still runs the steps after them', async () => {
    const stop = jest.fn().mockRejectedValue(new Error('stop failed'));

    await expect(
      runTeardown(
        () => Promise.reject(new Error('disconnect failed')),
        () => stop(),
      ),
    ).rejects.toThrow(AggregateError);

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('skips missing resources and resolves when nothing fails', async () => {
    const stop = jest.fn().mockResolvedValue(undefined);

    await expect(
      runTeardown(
        undefined,
        () => Promise.resolve(),
        () => stop(),
      ),
    ).resolves.toBeUndefined();

    expect(stop).toHaveBeenCalledTimes(1);
  });
});
