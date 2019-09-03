import Joi = require("joi");

import Intent, { subprojectIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { randomString } from "../../hash";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import * as AuthToken from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import { CurrencyCode, currencyCodeSchema } from "./money";
import * as Project from "./project";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";
import * as Subproject from "./subproject";
import * as SubprojectCreated from "./subproject_created";
import { sourceSubprojects } from "./subproject_eventsourcing";

export interface RequestData {
  projectId: Project.Id;
  subprojectId?: Subproject.Id;
  status?: "open" | "closed";
  displayName: string;
  description?: string;
  assignee?: string;
  currency: CurrencyCode;
  projectedBudgets?: ProjectedBudget[];
  additionalData?: object;
}

const requestDataSchema = Joi.object({
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema,
  status: Joi.string().valid("open", "closed"),
  displayName: Joi.string().required(),
  description: Joi.string().allow(""),
  assignee: Joi.string(),
  currency: currencyCodeSchema.required(),
  projectedBudgets: projectedBudgetListSchema,
  additionalData: AdditionalData.schema,
});

export function validate(input: any): RequestData {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  subprojectExists(projectId: string, subprojectId: string): Promise<boolean>;
  projectPermissions(projectId: string): Promise<Result.Type<Permissions>>;
}

export async function createSubproject(
  ctx: Ctx,
  creatingUser: ServiceUser,
  reqData: RequestData,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const publisher = creatingUser.id;

  const projectId = reqData.projectId;
  const subprojectId = reqData.subprojectId || randomString();
  const subprojectCreated = SubprojectCreated.createEvent(ctx.source, publisher, projectId, {
    id: subprojectId,
    status: reqData.status || "open",
    displayName: reqData.displayName,
    description: reqData.description || "",
    assignee: reqData.assignee || creatingUser.id,
    currency: reqData.currency,
    projectedBudgets: reqData.projectedBudgets || [],
    permissions: newDefaultPermissionsFor(creatingUser.id),
    additionalData: reqData.additionalData || {},
  });

  // Make sure for each organization and currency there is only one entry:
  const badEntry = findDuplicateBudgetEntry(subprojectCreated.subproject.projectedBudgets);
  if (badEntry !== undefined) {
    const error = new Error(
      `more than one projected budget for organization ${badEntry.organization} and currency ${badEntry.currencyCode}`,
    );
    return new InvalidCommand(ctx, subprojectCreated, [error]);
  }

  if (
    await repository.subprojectExists(subprojectCreated.projectId, subprojectCreated.subproject.id)
  ) {
    return new PreconditionError(ctx, subprojectCreated, "subproject already exists");
  }

  const projectPermissionsResult = await repository.projectPermissions(projectId);
  if (Result.isErr(projectPermissionsResult)) {
    const error = new PreconditionError(
      ctx,
      subprojectCreated,
      `cannot get project permissions for project ${projectId}: ${projectPermissionsResult.message}`,
    );
    return error;
  }

  // Check authorization (if not root):
  const projectPermissions = await repository.projectPermissions(projectId);
  if (Result.isErr(projectPermissions)) {
    return new NotFound(ctx, "project", projectId);
  }

  if (creatingUser.id !== "root") {
    const intent = "project.createSubproject";
    if (!AuthToken.permits(projectPermissions, creatingUser, [intent])) {
      return new NotAuthorized({
        ctx,
        userId: creatingUser.id,
        intent,
        target: { projectId, projectPermissions },
      });
    }
  } else {
    return new PreconditionError(
      ctx,
      subprojectCreated,
      "user 'root' is not allowed to create subprojects",
    );
  }

  // Check that the event is valid:
  const result = SubprojectCreated.createFrom(ctx, subprojectCreated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, subprojectCreated, [result]);
  }

  return { newEvents: [subprojectCreated] };
}

function newDefaultPermissionsFor(userId: string): Permissions {
  // The user can always do anything anyway:
  if (userId === "root") return {};

  const intents: Intent[] = subprojectIntents;
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [userId] }), {});
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
