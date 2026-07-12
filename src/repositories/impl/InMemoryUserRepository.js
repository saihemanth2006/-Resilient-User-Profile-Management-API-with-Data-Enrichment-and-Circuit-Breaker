class InMemoryUserRepository {
  constructor(store) {
    this.store = store;
  }

  async create(user) {
    this.store.users.set(user.id, { ...user });
    return { ...user };
  }

  async findById(id) {
    const user = this.store.users.get(id);
    return user ? { ...user } : null;
  }

  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    for (const user of this.store.users.values()) {
      if (user.email === normalizedEmail) {
        return { ...user };
      }
    }
    return null;
  }

  async findAll() {
    return [...this.store.users.values()].map((user) => ({ ...user }));
  }

  async update(id, updates) {
    const existing = this.store.users.get(id);
    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      ...updates,
    };

    this.store.users.set(id, updated);
    return { ...updated };
  }

  async delete(id) {
    return this.store.users.delete(id);
  }
}

module.exports = InMemoryUserRepository;
