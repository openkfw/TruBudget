import Joi = require("joi");

type Type = "general" | "restricted";

const workflowitemTypes: Type[] = ["general", "restricted"];

export const workflowitemTypeSchema = Joi.string().valid(...workflowitemTypes);
export default Type;
