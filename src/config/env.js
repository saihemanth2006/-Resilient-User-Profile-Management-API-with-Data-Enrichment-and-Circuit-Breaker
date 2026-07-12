const dotenv = require('dotenv');

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toInt(value, defaultValue) {
  const parsed = Number.parseInt(value ?? `${defaultValue}`, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

function toFloat(value, defaultValue) {
  const parsed = Number.parseFloat(value ?? `${defaultValue}`);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

module.exports = {
  port: toInt(process.env.PORT, 8080),
  db: {
    engine: (process.env.DB_ENGINE || 'mysql').toLowerCase(),
    host: process.env.DB_HOST || 'db',
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'user_profiles_db',
    poolLimit: toInt(process.env.DB_POOL_LIMIT, 10),
  },
  external: {
    url: required('EXTERNAL_SERVICE_URL', 'http://mock_enrichment_service:8081/enrich'),
    timeoutMs: toInt(process.env.EXTERNAL_SERVICE_TIMEOUT_MS, 1500),
  },
  circuitBreaker: {
    failureThreshold: toInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD, 5),
    resetTimeoutMs: toInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS, 30000),
    halfOpenSuccessThreshold: toInt(process.env.CIRCUIT_BREAKER_HALF_OPEN_SUCCESS_THRESHOLD, 2),
  },
  retry: {
    maxAttempts: toInt(process.env.RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toInt(process.env.RETRY_BASE_DELAY_MS, 100),
  },
  mockService: {
    failureRate: toFloat(process.env.MOCK_SERVICE_FAILURE_RATE, 0.4),
    delayMs: toInt(process.env.MOCK_SERVICE_DELAY_MS, 200),
    port: toInt(process.env.MOCK_PORT, 8081),
  },
};
