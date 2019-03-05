import Joi = require("joi");

import { GroupTraceEvent, groupTraceEventSchema } from "./organization/group_trace_event";
import { ProjectTraceEvent, projectTraceEventSchema } from "./workflow/project_trace_event";
import {
  SubprojectTraceEvent,
  subprojectTraceEventSchema,
} from "./workflow/subproject_trace_event";
import {
  WorkflowitemTraceEvent,
  workflowitemTraceEventSchema,
} from "./workflow/workflowitem_trace_event";

export type TraceEvent =
  | GroupTraceEvent
  | ProjectTraceEvent
  | SubprojectTraceEvent
  | WorkflowitemTraceEvent;

export const traceEventSchema = Joi.alternatives([
  groupTraceEventSchema,
  projectTraceEventSchema,
  subprojectTraceEventSchema,
  workflowitemTraceEventSchema,
]);
