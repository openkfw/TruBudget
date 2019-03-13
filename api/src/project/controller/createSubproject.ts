/**
 * DEPRECATED - see index.ts
 */
import { isArray } from "util";
import { VError } from "verror";

import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { Permissions } from "../../authz/types";
import { HttpResponse, throwParseError, throwParseErrorIfUndefined } from "../../httpd/lib";
import { Ctx } from "../../lib/ctx";
import { isEmpty } from "../../lib/emptyChecks";
import { isNonemptyString, isObject, isUserOrUndefined, value } from "../../lib/validation";
import * as Result from "../../result";
import { ConnToken } from "../../service/conn";
import { ServiceUser } from "../../service/domain/organization/service_user";
import { randomString } from "../../service/hash";
import * as ProjectGet from "../../service/project_get";
import * as Subproject from "../../subproject/model/Subproject";
import logger from "../../lib/logger";

export async function createSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  req,
): Promise<HttpResponse> {
  const body = req.body;

  if (body.apiVersion !== "1.0") {
    throwParseError(["apiVersion"]);
  }
  throwParseErrorIfUndefined(body, ["data"]);
  const data = body.data;

  const projectId: string = value("projectId", data.projectId, isNonemptyString);

  const userIntent: Intent = "project.createSubproject";

  const projectResult = await ProjectGet.getProject(conn, ctx, serviceUser, projectId);
  if (Result.isErr(projectResult)) {
    throw new VError(projectResult, `could not create subproject`);
  }
  const project = projectResult;

  // Is the user allowed to create subprojects?
  await throwIfUnauthorized(req.user, userIntent, project.permissions);

  // Make sure the parent project is not already closed:
  if (project.status === "closed") {
    throw new Error(`Cannot add a subproject to the closed project ${projectId}.`);
  }

  throwParseErrorIfUndefined(data, ["subproject"]);
  const subprojectArgs = data.subproject;
  logger.fatal({ subprojectArgs }, "XXX");

  const subprojectId = value("id", subprojectArgs.id, isNonemptyString, randomString());

  // check if subprojectId already exists
  const subprojects = await Subproject.get(conn.multichainClient, req.user, projectId);
  if (!isEmpty(subprojects.filter(s => s.data.id === subprojectId))) {
    throw new Error(
      `cannot add subproject ${subprojectId} to project ${projectId}: the project already contains a subproject with that ID`,
    );
  }

  const ctime = new Date();

  const subproject: Subproject.Data = {
    id: subprojectId,
    creationUnixTs: ctime.getTime().toString(),
    status: value("status", subprojectArgs.status, x => ["open", "closed"].includes(x), "open"),
    displayName: value("displayName", subprojectArgs.displayName, isNonemptyString),
    description: value("description", subprojectArgs.description, isNonemptyString),
    currency: value("currency", subprojectArgs.currency, isNonemptyString),
    projectedBudgets: value("projectedBudgets", subprojectArgs.projectedBudgets, isArray, []),
    assignee: value("assignee", subprojectArgs.assignee, isUserOrUndefined, req.user.userId),
    additionalData: value("additionalData", subprojectArgs.additionalData, isObject, {}),
  };

  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: ctime,
    dataVersion: 1,
    data: {
      subproject,
      permissions: getSubprojectDefaultPermissions(req.user),
    },
  };

  await Subproject.publish(conn.multichainClient, projectId, subprojectId, event);

  return [
    201,
    {
      apiVersion: "1.0",
      data: { created: true },
    },
  ];
}

function getSubprojectDefaultPermissions(token: AuthToken): Permissions {
  if (token.userId === "root") return {};

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
    "subproject.createWorkflowitem",
    "subproject.reorderWorkflowitems",
    "subproject.viewHistory",
  ];
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [token.userId] }), {});
}
