const { v4: uuidv4 } = require('uuid');
const { ConflictError, NotFoundError, ValidationError } = require('../utils/errors');

class UserService {
  constructor({ unitOfWork, enrichmentClient }) {
    this.unitOfWork = unitOfWork;
    this.enrichmentClient = enrichmentClient;
  }

  async createUser(payload) {
    this.validateUserPayload(payload);
    await this.unitOfWork.startTransaction();
    try {
      const repo = this.unitOfWork.userRepository();
      const existing = await repo.findByEmail(payload.email);
      if (existing) {
        throw new ConflictError('A user with this email already exists');
      }
      const user = {
        id: uuidv4(),
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        registrationDate: new Date().toISOString(),
      };
      const created = await repo.create(user);
      await this.unitOfWork.commit();
      return created;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }

  async getUserById(id) {
    this.validateId(id);
    const user = await this.unitOfWork.userRepository().findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUser(id, payload) {
    this.validateId(id);
    this.validateUserPayload(payload, true);
    await this.unitOfWork.startTransaction();
    try {
      const repo = this.unitOfWork.userRepository();
      const existing = await repo.findById(id);
      if (!existing) {
        throw new NotFoundError('User not found');
      }

      if (payload.email) {
        const duplicate = await repo.findByEmail(payload.email.trim().toLowerCase());
        if (duplicate && duplicate.id !== id) {
          throw new ConflictError('A user with this email already exists');
        }
      }

      const updated = await repo.update(id, {
        name: payload.name !== undefined ? payload.name.trim() : undefined,
        email: payload.email !== undefined ? payload.email.trim().toLowerCase() : undefined,
      });
      await this.unitOfWork.commit();
      return updated;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }

  async deleteUser(id) {
    this.validateId(id);
    await this.unitOfWork.startTransaction();
    try {
      const repo = this.unitOfWork.userRepository();
      const existing = await repo.findById(id);
      if (!existing) {
        throw new NotFoundError('User not found');
      }
      await repo.delete(id);
      await this.unitOfWork.commit();
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }

  async getEnrichedUser(id) {
    const user = await this.getUserById(id);
    try {
      const enrichmentResult = await this.enrichmentClient.fetchEnrichmentData(id);
      return {
        ...user,
        enrichedDataStatus: 'available',
        enrichment: enrichmentResult,
      };
    } catch (error) {
      return {
        ...user,
        enrichedDataStatus: 'unavailable',
        enrichmentMessage: 'External enrichment service unavailable, returning base profile only',
      };
    }
  }

  validateId(id) {
    if (!id || typeof id !== 'string' || id.trim().length < 3) {
      throw new ValidationError('Invalid user id', ['id must be a non-empty string']);
    }
  }

  validateUserPayload(payload, partial = false) {
    if (!payload || typeof payload !== 'object') {
      throw new ValidationError('Invalid request body', ['body must be an object']);
    }

    const details = [];

    if (!partial || payload.name !== undefined) {
      if (typeof payload.name !== 'string' || !payload.name.trim()) {
        details.push('name is required and must be a non-empty string');
      }
    }

    if (!partial || payload.email !== undefined) {
      if (typeof payload.email !== 'string' || !payload.email.trim()) {
        details.push('email is required and must be a non-empty string');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
        details.push('email must be a valid email address');
      }
    }

    if (details.length > 0) {
      throw new ValidationError('Validation failed', details);
    }
  }
}

module.exports = UserService;
