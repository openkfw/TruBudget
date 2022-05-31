import * as Joi from "joi";
import { isProductionEnvironment } from "../config";

// Regexes for TruBudget 2.x.x
export const safeStringSchema = Joi.string()
  .regex(/^([A-Za-zÀ-ÿ0-9-_!?@#$&*,"`´'.:/()[\] ]*)$/)
  .max(250);
export const safeIdSchema = Joi.string()
  .regex(/^([A-Za-zÀ-ÿ0-9-_]*)$/)
  .max(50);
export const safePasswordSchema = isProductionEnvironment()
  ? Joi.string()
      .regex(/^(?=.*[A-Za-zÀ-ÿ].*)(?=.*[0-9].*)([A-Za-zÀ-ÿ0-9-_!?@#$&*,.:/()[\] ])*$/)
      .min(8)
  : Joi.string();
