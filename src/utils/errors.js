class AppError extends Error {
  constructor(statusCode, errorCode, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(400, 'INVALID_INPUT', message, details);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'RESOURCE_NOT_FOUND', message);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, 'RESOURCE_CONFLICT', message);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', details = []) {
    super(503, 'SERVICE_UNAVAILABLE', message, details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
};
