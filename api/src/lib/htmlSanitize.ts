import * as sanitizeHtml from "sanitize-html";
import Joi = require("joi");

export const htmlStrip = {
  type: "string",
  base: Joi.string(),
  messages: {
    "string.htmlStrip": "remove all html tags from string",
  },
  rules: {
    htmlStrip: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean) {
          return clean;
        }
        return helpers.error("string.htmlStrip", { value });
      },
    },
  },
};
