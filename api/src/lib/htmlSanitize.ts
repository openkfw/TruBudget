import * as sanitizeHtml from "sanitize-html";
import * as Joi from "joi";

export const htmlStrip = (joi) => {
  return {
    name: "string",
    base: Joi.string(),
    language: {
      htmlStrip: "remove all html tags from string",
    },
    rules: [{
      name: "htmlStrip",
      validate(params, value, state, options) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });

        if (clean) {
          return clean;
        }
        return this.createError("string.htmlStrip", { value }, state, options);
      },
    }],
  };
};
