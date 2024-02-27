export class ValidationError extends Error {
  name = "ValidationError";
  inner = [];
  constructor(message) {
    super(message);
  }
}

function createErrorSchema(e) {
  const error = new ValidationError(e.message);
  error.inner = e.details.map((err) => ({
    message: err.message,
    path: err.path.join(".")
  }));
  return error;
}

export function joiFormikAdapter(schema, options = { abortEarly: false, allowUnknown: true }) {
  return {
    async validate(obj) {
      try {
        await schema.validateAsync(obj, options);
      } catch (err) {
        throw createErrorSchema(err);
      }
    }
  };
}
