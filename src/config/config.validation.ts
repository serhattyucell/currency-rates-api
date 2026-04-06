import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  API_KEYS: Joi.string().required(),
  TCMB_URL: Joi.string().uri().required(),
  CACHE_TTL_SECONDS: Joi.number().default(3600),
  THROTTLE_TTL_SECONDS: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
}).unknown();
