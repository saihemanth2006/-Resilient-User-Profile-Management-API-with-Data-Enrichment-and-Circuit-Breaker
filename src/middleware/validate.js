const { ValidationError } = require('../utils/errors');

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.errors.map((error) => error.message)));
      return;
    }
    req[property] = result.data;
    next();
  };
}

module.exports = validate;
