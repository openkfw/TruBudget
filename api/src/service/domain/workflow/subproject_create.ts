import Joi = require("joi");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import Intent, { subprojectIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import { randomString } from "../../hash";
import * as AdditionalData from "../additional_data";
import { AlreadyExists } from "../errors/already_exists";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import * as AuthToken from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import WorkflowitemType, { workflowitemTypeSchema } from "../workflowitem_types/types";
import WorkflowMode, { workflowModeSchema } from "../workflow/types";
import { CurrencyCode, currencyCodeSchema } from "./money";
import * as Project from "./project";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";
import * as Subproject from "./subproject";
import * as SubprojectCreated from "./subproject_created";

export interface RequestData {
  projectId: Project.Id;
  subprojectId?: Subproject.Id;
  status?: "open" | "closed";
  displayName: string;
  description?: string;
  assignee?: string;
  validator?: string;
  workflowitemType?: WorkflowitemType;
  currency: CurrencyCode;
  projectedBudgets?: ProjectedBudget[];
  additionalData?: object;
  workflowMode?: WorkflowMode;
}

const requestDataSchema = Joi.object({
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema,
  status: Joi.string().valid("open", "closed"),
  displayName: Joi.string().required(),
  description: Joi.string().allow(""),
  assignee: Joi.string(),
  validator: Joi.string(),
  workflowitemType: workflowitemTypeSchema,
  currency: currencyCodeSchema.required(),
  projectedBudgets: projectedBudgetListSchema,
  additionalData: AdditionalData.schema,
  workflowMode: workflowModeSchema,
});

export function validate(input): RequestData {
  const { value, error } = requestDataSchema.validate(input);
  return !error ? value : error;
}

interface Repository {
  subprojectExists(projectId: string, subprojectId: string): Promise<boolean>;
  projectPermissions(projectId: string): Promise<Result.Type<Permissions>>;
}

const inheritProjectPermissions = (
  subprojectInitialPermissions: Permissions,
  projectPermissions: Permissions,
  subprojectId?: string,
): Permissions => {
  const result = { ...subprojectInitialPermissions };
  for (const property in projectPermissions) {
    let subprojectPermissionsProperty = property.replace("project.", "subproject.");

    switch (property) {
      case "project.createSubproject": {
        subprojectPermissionsProperty = "subproject.createWorkflowitem";
        break;
      }
      default:
        break;
    }

    if (!subprojectIntents.includes(subprojectPermissionsProperty as Intent)) {
      // won't happen unless Intents are modified and there is an error in the implementation
      logger.error(
        `Subproject ${subprojectId} trying to inherit nonexistent property ${subprojectPermissionsProperty}`,
      );
      continue;
    }

    const permissions = [
      ...new Set([
        ...subprojectInitialPermissions[subprojectPermissionsProperty],
        ...projectPermissions[property],
      ]),
    ];
    Object.defineProperty(result, subprojectPermissionsProperty, {
      value: permissions,
      enumerable: true,
    });
  }
  return result;
};

export async function createSubproject(
  ctx: Ctx,
  issuer: ServiceUser,
  reqData: RequestData,
  repository: Repository,
): Promise<Result.Type<SubprojectCreated.Event>> {
  const publisher = issuer.id;

  const projectId = reqData.projectId;
  const subprojectId = reqData.subprojectId || randomString();

  logger.trace({ req: reqData }, "Trying to create 'SubprojectCreated' Event from request data");
  const createEvent = SubprojectCreated.createEvent(
    ctx.source,
    publisher,
    projectId,
    {
      id: subprojectId,
      status: reqData.status || "open",
      displayName: reqData.displayName,
      description: reqData.description || "",
      assignee: reqData.assignee || issuer.id,
      validator: reqData.validator,
      workflowitemType: reqData.workflowitemType,
      currency: reqData.currency,
      projectedBudgets: reqData.projectedBudgets || [],
      permissions: newDefaultPermissionsFor(issuer.id),
      additionalData: reqData.additionalData || {},
      workflowMode: reqData.workflowMode || "ordered",
    },
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(createEvent)) {
    return new VError(createEvent, "failed to create subproject created event");
  }

  // Make sure for each organization and currency there is only one entry:
  logger.trace({ event: createEvent }, "Checking if entry is unique per organization and currency");
  const badEntry = findDuplicateBudgetEntry(createEvent.subproject.projectedBudgets);
  if (badEntry !== undefined) {
    return new AlreadyExists(
      ctx,
      createEvent,
      `${badEntry.organization}:${badEntry.currencyCode}`,
      `There already is a projected budget for organization ${badEntry.organization} and currency ${badEntry.currencyCode}`,
    );
  }

  // Subproject already exists
  if (await repository.subprojectExists(createEvent.projectId, createEvent.subproject.id)) {
    return new AlreadyExists(ctx, createEvent, createEvent.subproject.id);
  }

  logger.trace({ user: issuer }, "Checking authorization of user");
  const projectPermissions = await repository.projectPermissions(projectId);
  if (Result.isErr(projectPermissions)) {
    const error = new PreconditionError(
      ctx,
      createEvent,
      `cannot get project permissions for project ${projectId}: ${projectPermissions.message}`,
    );
    return error;
  }

  if (issuer.id !== "root") {
    const intent = "project.createSubproject";
    if (!AuthToken.permits(projectPermissions, issuer, [intent])) {
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent,
        target: { projectId, projectPermissions },
      });
    }
  } else {
    return new PreconditionError(
      ctx,
      createEvent,
      "user 'root' is not allowed to create subprojects",
    );
  }

  createEvent.subproject.permissions = inheritProjectPermissions(
    createEvent.subproject.permissions,
    projectPermissions,
    createEvent.subproject.id,
  );

  logger.trace({ event: createEvent }, "Checking if Event is valid");
  const result = SubprojectCreated.createFrom(ctx, createEvent);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, createEvent, [result]);
  }

  return createEvent;
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
