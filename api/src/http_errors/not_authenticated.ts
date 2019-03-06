export const schema = {
  description: "Authentication required",
  type: "object",
  properties: {
    apiVersion: { type: "string", example: "1.0" },
    error: {
      type: "object",
      properties: {
        code: { type: "string", example: "401" },
        message: {
          type: "string",
          example: "A valid bearer-type HTTP authorization token (JWT) is required for this route.",
        },
      },
    },
  },
};
