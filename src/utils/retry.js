function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(action, { maxAttempts, baseDelayMs, logger = console }) {
  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await action(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) {
        break;
      }
      const delay = baseDelayMs * (2 ** (attempt - 1));
      logger.warn(`Retry attempt ${attempt} failed, waiting ${delay}ms before next attempt`);
      await sleep(delay);
    }
  }

  throw lastError;
}

module.exports = {
  withRetry,
};
