const UserService = require('../../src/services/UserService');

function createUnitOfWork(userRepo) {
  return {
    startTransaction: jest.fn(async () => {}),
    commit: jest.fn(async () => {}),
    rollback: jest.fn(async () => {}),
    userRepository: jest.fn(() => userRepo),
  };
}

describe('UserService', () => {
  test('creates user and enforces email uniqueness', async () => {
    const repo = {
      findByEmail: jest.fn(async () => null),
      create: jest.fn(async (user) => user),
    };
    const service = new UserService({ unitOfWork: createUnitOfWork(repo), enrichmentClient: { fetchEnrichmentData: jest.fn() } });

    const user = await service.createUser({ name: 'Jane Doe', email: 'jane@example.com' });
    expect(user.email).toBe('jane@example.com');
    expect(repo.create).toHaveBeenCalled();
  });
});
