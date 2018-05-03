import * as Project from ".";
import { throwIfUnauthorized } from "../authz/index";
import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent } from "../authz/types";
import {
  AuthenticatedRequest,
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined,
} from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain/Client.h";
import { randomString } from "../multichain/hash";
import * as Subproject from "../subproject";
import { assign } from "../subproject/index";

export const createSubproject = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const body = req.body;

  if (body.apiVersion !== "1.0") throwParseError(["apiVersion"]);
  throwParseErrorIfUndefined(body, ["data"]);
  const data = body.data;

  const projectId: string = value("projectId", data.projectId, isNonemptyString);

  throwParseErrorIfUndefined(data, ["subproject"]);
  const subproject = data.subproject;

  // Is the user allowed to create subprojects?
  await throwIfUnauthorized(
    req.token,
    "project.createSubproject",
    await Project.getPermissions(multichain, projectId),
  );

  await Subproject.create(
    multichain,
    req.token,
    projectId,
    {
      id: value("id", subproject.id, isNonemptyString, randomString()),
      creationUnixTs: Date.now().toString(),
      status: value("status", subproject.status, x => ["open", "closed"].includes(x), "open"),
      displayName: value("displayName", subproject.displayName, isNonemptyString),
      description: value("description", subproject.description, isNonemptyString),
      amount: value("amount", subproject.amount, isNonemptyString),
      assignee: value("assignee", subproject.assignee, isNonemptyString),
      currency: value("currency", subproject.currency, isNonemptyString).toUpperCase(),
    },
    defaultPermissions(req.token.userId),
  );

  return [
    201,
    {
      apiVersion: "1.0",
      data: { created: true },
    },
  ];
};

const defaultPermissions = (userId: string): AllowedUserGroupsByIntent => {
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
    "subproject.createWorkflowitem",
  ];
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [userId] }), {});
};
