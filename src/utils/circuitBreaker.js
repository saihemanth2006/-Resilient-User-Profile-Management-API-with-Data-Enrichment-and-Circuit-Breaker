class CircuitBreaker {
  constructor({ failureThreshold, resetTimeoutMs, halfOpenSuccessThreshold, logger = console }) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.halfOpenSuccessThreshold = halfOpenSuccessThreshold;
    this.logger = logger;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.openedAt = null;
  }

  canRequest() {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt >= this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        this.failureCount = 0;
        this.logger.warn('Circuit breaker transitioned to HALF_OPEN');
        return true;
      }
      return false;
    }
    return true;
  }

  async execute(action, fallback) {
    if (!this.canRequest()) {
      return fallback(new Error('Circuit breaker is open'), this.getState());
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      if (this.state === 'OPEN') {
        return fallback(error, this.getState());
      }
      throw error;
    }
  }

  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount += 1;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.logger.info('Circuit breaker transitioned to CLOSED');
      }
      return;
    }

    this.failureCount = 0;
  }

  onFailure(error) {
    if (this.state === 'HALF_OPEN') {
      this.trip(error);
      return;
    }

    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.trip(error);
    }
  }

  trip(error) {
    this.state = 'OPEN';
    this.openedAt = Date.now();
    this.failureCount = 0;
    this.successCount = 0;
    this.logger.warn(`Circuit breaker opened: ${error.message}`);
  }

  getState() {
    return this.state;
  }
}

module.exports = CircuitBreaker;
