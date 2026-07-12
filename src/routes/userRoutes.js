const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
}).refine((data) => data.name !== undefined || data.email !== undefined, {
  message: 'At least one of name or email must be provided',
});

const idParamSchema = z.object({
  id: z.string().min(3),
});

module.exports = function createUserRoutes(userController) {
  const router = express.Router();

  router.post('/', validate(userCreateSchema), asyncHandler(userController.create));
  router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(userController.getById));
  router.put('/:id', validate(idParamSchema, 'params'), validate(userUpdateSchema), asyncHandler(userController.update));
  router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(userController.remove));
  router.get('/:id/enriched', validate(idParamSchema, 'params'), asyncHandler(userController.getEnriched));

  return router;
};
