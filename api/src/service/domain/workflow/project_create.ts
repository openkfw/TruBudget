import Joi = require("joi");

import Intent, { projectIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { randomString } from "../../hash";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as GlobalPermissions from "./global_permissions";
import * as Project from "./project";
import * as ProjectCreated from "./project_created";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";

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

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getGlobalPermissions(): Promise<GlobalPermissions.GlobalPermissions>;
  projectExists(projectId: string): Promise<boolean>;
}

export async function createProject(
  ctx: Ctx,
  creatingUser: ServiceUser,
  data: RequestData,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  const source = ctx.source;
  const publisher = creatingUser.id;

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

  // Make sure for each organization and currency there is only one entry:
  const badEntry = findDuplicateBudgetEntry(createEvent.project.projectedBudgets);
  if (badEntry !== undefined) {
    const error = new Error(
      `more than one projected budget for organization ${badEntry.organization} and currency ${
        badEntry.currencyCode
      }`,
    );
    return { newEvents: [], errors: [new InvalidCommand(ctx, createEvent, [error])] };
  }

  if (await repository.projectExists(createEvent.project.id)) {
    return {
      newEvents: [],
      errors: [new PreconditionError(ctx, createEvent, "project already exists")],
    };
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const intent = "global.createProject";
    const permissions = await repository.getGlobalPermissions();
    if (!GlobalPermissions.permits(permissions, creatingUser, [intent])) {
      return {
        newEvents: [],
        errors: [new NotAuthorized({ ctx, userId: creatingUser.id, intent, target: permissions })],
      };
    }
  } else {
    return {
      newEvents: [],
      errors: [
        new PreconditionError(ctx, createEvent, "user 'root' is not allowed to create projects"),
      ],
    };
  }

  // Check that the event is valid:
  const result = ProjectCreated.createFrom(ctx, createEvent);
  if (Result.isErr(result)) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, createEvent, [result])] };
  }

  return { newEvents: [createEvent], errors: [] };
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
