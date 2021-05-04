import Joi from "@hapi/joi";

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
  );

const isBodyValid = (request, payload) => {
  const schema = schemes.get(request);
  if (!schema) {
    throw new Error(`Validation schema for request ${request} not implemented yet`);
  }
  const validatePayload = schema.validate(payload, { abortEarly: false }, (error, values) => error);
  if (validatePayload.error) {
    // eslint-disable-next-line no-console
    console.error("validation error", validatePayload.error);
    // eslint-disable-next-line no-console
    console.log("validation values", validatePayload.value);
    return false;
  }
  return true;
};

export default isBodyValid;
