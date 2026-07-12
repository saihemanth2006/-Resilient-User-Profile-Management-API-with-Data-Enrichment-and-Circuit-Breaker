class UnitOfWork {
  async startTransaction() {
    throw new Error('Not implemented');
  }

  async commit() {
    throw new Error('Not implemented');
  }

  async rollback() {
    throw new Error('Not implemented');
  }

  userRepository() {
    throw new Error('Not implemented');
  }
}

module.exports = UnitOfWork;
