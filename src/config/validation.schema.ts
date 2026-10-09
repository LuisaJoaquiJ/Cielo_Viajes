import * as Joi from 'joi';

export const validationSchema = Joi.object({
  API_PREFIX: Joi.string().default('api'),
  DATABASE_URL: Joi.string().uri().required(),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_SECRET: Joi.string().min(8).default('dev-secret-change-me'),
  PORT: Joi.number().port().default(3001),
});
