import Joi = require("joi");

import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import Intent, { projectIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import { randomString } from "../../hash";
import * as AdditionalData from "../additional_data";
import { AlreadyExists } from "../errors/already_exists";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as GlobalPermissions from "./global_permissions";
import * as Project from "./project";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";
import * as ProjectCreated from "./project_created";

/**
 * Initial data for the new project as given in the request.
 *
 * Looks a lot like `InitialData` in the domain layer's `project_created.ts`, except
 * that there are more optional fields that get initialized using default values.
 */
export interface RequestData {
  id?: string;
  status?: "open" | "closed";
  displayName: string;
  description?: string;
  assignee?: string;
  thumbnail?: string;
  projectedBudgets?: ProjectedBudget[];
  additionalData?: AdditionalData.AdditionalData;
  tags?: string[];
}

const requestDataSchema = Joi.object({
  id: Project.idSchema,
  status: Joi.string().valid("open", "closed"),
  displayName: Joi.string().required(),
  description: Joi.string().allow(""),
  assignee: Joi.string(),
  thumbnail: Joi.string().allow(""),
  projectedBudgets: projectedBudgetListSchema,
  additionData: AdditionalData.schema,
  tags: Joi.array().items(Project.tagsSchema),
});

export function validate(input): Result.Type<RequestData> {
  const { value, error } = requestDataSchema.validate(input);
  return !error ? value : error;
}

interface Repository {
  getGlobalPermissions(): Promise<Result.Type<GlobalPermissions.GlobalPermissions>>;
  projectExists(projectId: string): Promise<boolean>;
}

export async function createProject(
  ctx: Ctx,
  creatingUser: ServiceUser,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<ProjectCreated.Event>> {
  const source = ctx.source;
  const publisher = creatingUser.id;

  logger.trace({ req: data }, "Trying to create 'ProjectCreated' Event from request data");
  const createEvent = ProjectCreated.createEvent(source, publisher, {
    id: data.id || randomString(),
    status: data.status || "open",
    displayName: data.displayName,
    description: data.description || "",
    assignee: data.assignee || creatingUser.id,
    thumbnail: data.thumbnail || "",
    projectedBudgets: data.projectedBudgets || [],
    permissions: newDefaultPermissionsFor(creatingUser),
    additionalData: data.additionalData || {},
    tags: data.tags || [],
  });
  if (Result.isErr(createEvent)) {
    return new VError(createEvent, "failed to create project created event");
  }

  logger.trace({ event: createEvent }, "Checking if entry is unique per organization and currency");
  const badEntry = findDuplicateBudgetEntry(createEvent.project.projectedBudgets);
  if (badEntry !== undefined) {
    return new AlreadyExists(
      ctx,
      createEvent,
      `${badEntry.organization}:${badEntry.currencyCode}`,
      `There already is a projected budget for organization ${badEntry.organization} and currency ${badEntry.currencyCode}`,
    );
  }

  // Project already exists
  if (await repository.projectExists(createEvent.project.id)) {
    return new AlreadyExists(ctx, createEvent, createEvent.project.id);
  }

  // Reject if root
  if (creatingUser.id === "root") {
    return new PreconditionError(ctx, createEvent, "user 'root' is not allowed to create projects");
  }

  logger.trace({ user: creatingUser }, "Check for user is permitted globally");
  const intent = "global.createProject";
  const globalPermissionsResult = await repository.getGlobalPermissions();
  if (Result.isErr(globalPermissionsResult)) {
    return new VError(globalPermissionsResult, "get global permissions failed");
  }
  const globalPermissions = globalPermissionsResult;
  if (!GlobalPermissions.permits(globalPermissions, creatingUser, [intent])) {
    return new NotAuthorized({ ctx, userId: creatingUser.id, intent, target: globalPermissions });
  }

  logger.trace({ event: createEvent }, "Checking if Event is valid");
  const result = ProjectCreated.createFrom(ctx, createEvent);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, createEvent, [result]);
  }

  return createEvent;
}

function newDefaultPermissionsFor(user: ServiceUser): Permissions {
  // The user can always do anything anyway:
  if (user.id === "root") return {};

  const intents: Intent[] = projectIntents;
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [user.id] }), {});
}

function findDuplicateBudgetEntry(
  projectedBudgets: ProjectedBudget[],
): { organization: string; currencyCode: string } | undefined {
  const budgetSet = new Set<string>();
  for (const { organization, currencyCode } of projectedBudgets) {
    const key = `${organization}_${currencyCode}`;
    if (budgetSet.has(key)) {
      return { organization, currencyCode };
    }
    budgetSet.add(key);
  }
}
