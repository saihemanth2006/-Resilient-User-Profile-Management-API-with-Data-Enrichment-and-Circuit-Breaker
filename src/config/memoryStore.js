function createInitialUsers() {
  return new Map([
    [
      'user-1',
      {
        id: 'user-1',
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        registrationDate: '2023-01-15T10:00:00.000Z',
      },
    ],
    [
      'user-2',
      {
        id: 'user-2',
        name: 'Bob The Builder',
        email: 'bob@example.com',
        registrationDate: '2023-01-16T11:30:00.000Z',
      },
    ],
    [
      'user-3',
      {
        id: 'user-3',
        name: 'Charlie Chaplin',
        email: 'charlie@example.com',
        registrationDate: '2023-01-17T14:00:00.000Z',
      },
    ],
  ]);
}

function createMemoryStore() {
  return {
    users: createInitialUsers(),
  };
}

module.exports = createMemoryStore;
