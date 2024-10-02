import Joi = require("joi");

type WorkflowMode = "ordered" | "unordered";

const workflowModes: WorkflowMode[] = ["ordered", "unordered"];

export const workflowModeSchema = Joi.string()
  .valid(...workflowModes)
  .allow("");
export default WorkflowMode;
