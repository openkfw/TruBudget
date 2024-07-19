import Joi from "@hapi/joi";
import logger from "./logger";

const schemes = new Map();
schemes
  .set(
    "/user.insert",
    Joi.object({
      user: Joi.object({
        id: Joi.string().required(),
        emailAddress: Joi.string().email().required(),
      }),
    }),
  )
  .set(
    "/user.update",
    Joi.object({
      user: Joi.object({
        id: Joi.string().required(),
        emailAddress: Joi.string().email().required(),
      }),
    }),
  )
  .set(
    "/user.delete",
    Joi.object({
      user: Joi.object({
        id: Joi.string().required(),
        emailAddress: Joi.string().email().required(),
      }),
    }),
  )
  .set(
    "/user.getEmailAddress",
    Joi.object({
      id: Joi.string().required(),
    }),
  )
  .set(
    "/notification.send",
    Joi.object({
      user: Joi.object({
        id: Joi.string().required(),
      }),
    }),
  )
  .set(
    "/user.getUserByEmail",
    Joi.object({
      email: Joi.string().required(),
    }),
  )
  .set(
    "/sendResetPasswordEmail",
    Joi.object({
      id: Joi.string().required(),
      email: Joi.string().email().required(),
      link: Joi.string().required(),
      lang: Joi.string().required(),
    }),
  );

const isBodyValid = (request, payload): boolean => {
  logger.debug({ request, payload }, "Checking request validity");
  const schema = schemes.get(request);
  if (!schema) {
    throw new Error(`Validation schema for request ${request} not implemented yet`);
  }
  const validatePayload = schema.validate(payload, { abortEarly: false }, (error, values) => error);
  if (validatePayload.error) {
    logger.error("validation error", validatePayload.error);
    logger.info("validation values", validatePayload.value);
    return false;
  }
  return true;
};

export default isBodyValid;
