import * as Joi from "joi";
import { isProductionEnvironment } from "../config";

// Regexes for TruBudget 1.x.x
// ToDo Replace with the new Regexes for new major release (TruBudget 2.x.x)
export const safeStringSchema = Joi.string().regex(/.*/).max(250);
export const safeIdSchema = Joi.string().regex(/.*/).max(50);

export const safePasswordSchema = isProductionEnvironment()
  ? Joi.string()
      .regex(/^(?=.*[A-Za-zÀ-ÿ].*)(?=.*[0-9].*)([A-Za-zÀ-ÿ0-9-_!?@#$&*,.:/()[\] ])*$/)
      .min(8)
      .max(100)
  : Joi.string();

// Regexes for TruBudget 2.x.x
// These Regexes will not work with multichain data from TruBudget 1.x.x
// For TruBudget 2.x.x, also uncomment file joiValidation.spec.ts

// export const safeStringSchema = Joi.string()
//   .regex(/^([A-Za-zÀ-ÿ0-9-_!?@#$&*,"`´'.:/()[\] ]*)$/)
//   .max(250);
// export const safeIdSchema = Joi.string()
//   .regex(/^([A-Za-zÀ-ÿ0-9-_]*)$/)
//   .max(50);
// export const safePasswordSchema = isProductionEnvironment()
//   ? Joi.string()
//       .regex(/^(?=.*[A-Za-zÀ-ÿ].*)(?=.*[0-9].*)([A-Za-zÀ-ÿ0-9-_!?@#$&*,.:/()[\] ])*$/)
//       .min(8)
//   : Joi.string();
