const { withRetry } = require('../../src/utils/retry');

describe('withRetry', () => {
  test('retries until success', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('transient');
      }
      return 'ok';
    }, { maxAttempts: 3, baseDelayMs: 1, logger: { warn: jest.fn() } });

    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });
});
