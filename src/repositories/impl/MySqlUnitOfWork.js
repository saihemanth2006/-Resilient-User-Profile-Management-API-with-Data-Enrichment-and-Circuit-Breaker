const MySqlUserRepository = require('./MySqlUserRepository');

class MySqlUnitOfWork {
  constructor(pool) {
    this.pool = pool;
    this.connection = null;
    this.userRepo = new MySqlUserRepository(pool);
  }

  async startTransaction() {
    this.connection = await this.pool.getConnection();
    await this.connection.beginTransaction();
    this.userRepo = new MySqlUserRepository(this.connection);
  }

  async commit() {
    if (this.connection) {
      await this.connection.commit();
      this.connection.release();
      this.connection = null;
      this.userRepo = new MySqlUserRepository(this.pool);
    }
  }

  async rollback() {
    if (this.connection) {
      await this.connection.rollback();
      this.connection.release();
      this.connection = null;
      this.userRepo = new MySqlUserRepository(this.pool);
    }
  }

  userRepository() {
    if (!this.userRepo) {
      throw new Error('Transaction has not been started');
    }
    return this.userRepo;
  }
}

module.exports = MySqlUnitOfWork;
