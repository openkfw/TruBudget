export const schema = {
  description: "Not found",
  type: "object",
  properties: {
    apiVersion: { type: "string", example: "1.0" },
    error: {
      type: "object",
      properties: {
        code: { type: "string", example: "404" },
        message: {
          type: "string",
          example: "The route you are looking for was not found.",
        },
      },
    },
  },
};
