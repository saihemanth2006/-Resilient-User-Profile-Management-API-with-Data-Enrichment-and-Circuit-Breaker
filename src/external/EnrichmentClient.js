const axios = require('axios');
const CircuitBreaker = require('../utils/circuitBreaker');
const { withRetry } = require('../utils/retry');
const { ServiceUnavailableError } = require('../utils/errors');

class EnrichmentClient {
  constructor({ baseUrl, timeoutMs, retryConfig, circuitBreakerConfig, logger = console }) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.logger = logger;
    this.breaker = new CircuitBreaker({ ...circuitBreakerConfig, logger });
    this.retryConfig = retryConfig;
  }

  async fetchEnrichmentData(userId) {
    return this.breaker.execute(
      async () => withRetry(async () => {
        const response = await axios.get(this.baseUrl, {
          timeout: this.timeoutMs,
          params: { userId },
          validateStatus: (status) => status < 500,
        });
        if (response.status >= 400) {
          throw new Error(`Enrichment service responded with ${response.status}`);
        }
        return response.data;
      }, this.retryConfig),
      async (error, state) => {
        throw new ServiceUnavailableError('Enrichment service unavailable', [
          `circuitBreakerState=${state}`,
          error.message,
        ]);
      },
    );
  }
}

module.exports = EnrichmentClient;
