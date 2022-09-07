import Joi = require("joi");
import { isProductionEnvironment } from "../config";
import { htmlStrip } from "./htmlSanitize";

const JoiBase = Joi.extend(htmlStrip);
// Sanitize input: first HTML & then for the rest.
// Sanitized html will be saved not rejected this is because we can not just ignore html tags in regex
// ignoring html tags would imply banning <> etc. but we would like to allow them for project names etc.

// Regex based on: https://www.regular-expressions.info/unicode.html#prop

export const safeStringSchema = JoiBase.string()
  .trim()
  .htmlStrip()
  .regex(/^([\p{L}\p{N}\p{P}\p{M}\p{S}\p{Zs}]*)$/u)
  .max(250);

export const safeIdSchema = JoiBase.string()
  .trim()
  .htmlStrip()
  .regex(/^([A-Za-zÀ-ÿ0-9-_]*)$/)
  .max(50);

export const safePasswordSchema = isProductionEnvironment()
  ? JoiBase.string()
      .trim()
      .htmlStrip()
      .regex(/^(?=.*[A-Za-zÀ-ÿ].*)(?=.*[0-9].*)([A-Za-zÀ-ÿ0-9-_!?@#$&*,.:/()[\] ])*$/)
      .min(8)
  : JoiBase.string().trim().htmlStrip();
