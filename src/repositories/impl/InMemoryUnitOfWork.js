const InMemoryUserRepository = require('./InMemoryUserRepository');

class InMemoryUnitOfWork {
  constructor(store) {
    this.store = store;
    this.userRepo = new InMemoryUserRepository(store);
  }

  async startTransaction() {
    return undefined;
  }

  async commit() {
    return undefined;
  }

  async rollback() {
    return undefined;
  }

  userRepository() {
    return this.userRepo;
  }
}

module.exports = InMemoryUnitOfWork;
