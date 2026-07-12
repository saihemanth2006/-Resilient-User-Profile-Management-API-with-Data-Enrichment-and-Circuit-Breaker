const express = require('express');
const env = require('./config/env');
const createPool = require('./config/db');
const seedUsers = require('./config/seed');
const createMemoryStore = require('./config/memoryStore');
const MySqlUnitOfWork = require('./repositories/impl/MySqlUnitOfWork');
const InMemoryUnitOfWork = require('./repositories/impl/InMemoryUnitOfWork');
const UserService = require('./services/UserService');
const UserController = require('./controllers/UserController');
const createUserRoutes = require('./routes/userRoutes');
const EnrichmentClient = require('./external/EnrichmentClient');
const errorHandler = require('./middleware/errorHandler');

async function createApp() {
  const app = express();
  const usingMemoryDb = env.db.engine === 'memory';
  const store = usingMemoryDb ? createMemoryStore() : null;
  const pool = usingMemoryDb ? null : createPool();

  if (!usingMemoryDb) {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        registration_date DATETIME NOT NULL
      )
    `);

    await seedUsers(pool);
  }

  app.use(express.json());
  app.get('/health', async (req, res) => res.json({ status: 'ok' }));

  const unitOfWork = usingMemoryDb ? new InMemoryUnitOfWork(store) : new MySqlUnitOfWork(pool);
  const enrichmentClient = new EnrichmentClient({
    baseUrl: env.external.url,
    timeoutMs: env.external.timeoutMs,
    retryConfig: env.retry,
    circuitBreakerConfig: env.circuitBreaker,
  });

  const userService = new UserService({ unitOfWork, enrichmentClient });
  const userController = new UserController(userService);

  app.use('/api/users', createUserRoutes(userController));
  app.use(errorHandler);

  return { app, pool };
}

if (require.main === module) {
  createApp()
    .then(({ app }) => {
      app.listen(env.port, () => {
        console.log(`Server listening on port ${env.port}`);
      });
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createApp };
