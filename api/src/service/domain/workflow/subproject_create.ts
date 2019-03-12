import Joi = require("joi");

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { randomString } from "../../hash";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import { CurrencyCode, currencyCodeSchema } from "./money";
import * as Project from "./project";
import { sourceProjects } from "./project_eventsourcing";
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
  // If there is no such project, the promise should resolve to an empty array:
  getProjectEvents(projectId: string): Promise<BusinessEvent[]>;
}

export async function createSubproject(
  ctx: Ctx,
  creatingUser: ServiceUser,
  reqData: RequestData,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  const publisher = creatingUser.id;

  const subprojectId = reqData.subprojectId || randomString();
  const subprojectCreated = SubprojectCreated.createEvent(
    ctx.source,
    publisher,
    reqData.projectId,
    {
      id: subprojectId,
      status: reqData.status || "open",
      displayName: reqData.displayName,
      description: reqData.description || "",
      assignee: reqData.assignee || creatingUser.id,
      currency: reqData.currency,
      projectedBudgets: reqData.projectedBudgets || [],
      permissions: newDefaultPermissionsFor(creatingUser.id),
      additionalData: reqData.additionalData || {},
    },
  );

  const projectEvents = await repository.getProjectEvents(reqData.projectId);
  const { projects } = sourceProjects(ctx, projectEvents);
  const project = projects.find(x => x.id === reqData.projectId);
  if (project === undefined) {
    return { newEvents: [], errors: [new NotFound(ctx, "project", reqData.projectId)] };
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const isAuthorized = (project.permissions["project.createSubproject"] || []).some(identity =>
      canAssumeIdentity(creatingUser, identity),
    );
    if (!isAuthorized) {
      return {
        newEvents: [],
        errors: [new NotAuthorized(ctx, creatingUser.id, subprojectCreated)],
      };
    }
  }

  // Check that the event is valid by trying to "apply" it:
  const { errors } = sourceSubprojects(ctx, [subprojectCreated]);
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, subprojectCreated, errors)] };
  }

  return { newEvents: [subprojectCreated], errors: [] };
}

function newDefaultPermissionsFor(userId: string): Permissions {
  // The user can always do anything anyway:
  if (userId === "root") return {};

  const intents: Intent[] = [
    "subproject.intent.listPermissions",
    "subproject.intent.grantPermission",
    "subproject.intent.revokePermission",
    "subproject.viewSummary",
    "subproject.viewDetails",
    "subproject.assign",
    "subproject.update",
    "subproject.close",
    "subproject.archive",
  ];
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [userId] }), {});
}
