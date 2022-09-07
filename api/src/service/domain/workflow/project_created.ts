import Joi = require("joi");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import { Permissions, permissionsSchema } from "../permissions";
import * as Project from "./project";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";

type EventTypeType = "project_created";
const eventType: EventTypeType = "project_created";

interface InitialData {
  id: Project.Id;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee: Identity;
  thumbnail?: string;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
  tags?: string[];
}

const initialDataSchema = Joi.object({
  id: Project.idSchema.required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string(),
  thumbnail: Joi.string().allow(""),
  projectedBudgets: projectedBudgetListSchema.required(),
  permissions: permissionsSchema.required(),
  additionalData: AdditionalData.schema.required(),
  tags: Joi.array().items(Project.tagsSchema),
}).options({ stripUnknown: true });

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  project: InitialData;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  project: initialDataSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  project: InitialData,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating project_created event");

  const event = {
    type: eventType,
    source,
    publisher,
    project,
    time,
  };
  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input): Result.Type<Event> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

export function createFrom(ctx: Ctx, event: Event): Result.Type<Project.Project> {
  const initialData = event.project;

  const project: Project.Project = {
    id: initialData.id,
    createdAt: event.time,
    status: initialData.status,
    displayName: initialData.displayName,
    description: initialData.description,
    assignee: initialData.assignee,
    thumbnail: initialData.thumbnail,
    projectedBudgets: initialData.projectedBudgets,
    permissions: initialData.permissions,
    log: [],
    additionalData: initialData.additionalData,
    tags: initialData.tags || [],
  };

  return Result.mapErr(
    Project.validate(project),
    (error) => new EventSourcingError({ ctx, event, target: project }, error),
  );
}
