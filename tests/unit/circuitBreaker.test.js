const CircuitBreaker = require('../../src/utils/circuitBreaker');

describe('CircuitBreaker', () => {
  test('opens after failure threshold and then transitions to half-open', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 1,
      halfOpenSuccessThreshold: 1,
      logger: { warn: jest.fn(), info: jest.fn() },
    });

    await expect(breaker.execute(async () => { throw new Error('fail'); }, async () => 'fallback')).rejects.toThrow('fail');
    await expect(breaker.execute(async () => { throw new Error('fail'); }, async () => 'fallback')).resolves.toBe('fallback');
    expect(breaker.getState()).toBe('OPEN');

    await new Promise((resolve) => setTimeout(resolve, 2));
    await expect(breaker.execute(async () => 'ok', async () => 'fallback')).resolves.toBe('ok');
    expect(breaker.getState()).toBe('CLOSED');
  });
});
