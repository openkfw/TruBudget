import * as Global from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent } from "../authz/types";
import { ProjectIdAlreadyExistsError } from "../error";
import {
  AuthenticatedRequest,
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined,
} from "../httpd/lib";
import { isEmpty } from "../lib/emptyChecks";
import logger from "../lib/logger";
import { isNonemptyString, isUserOrUndefined, value } from "../lib/validation";
import { MultichainClient } from "../multichain/Client.h";
import { randomString } from "../multichain/hash";
import * as Project from "../project/model/Project";

export async function createProject(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const body = req.body;

  if (body.apiVersion !== "1.0") {
    throwParseError(["apiVersion"]);
  }
  throwParseErrorIfUndefined(body, ["data", "project"]);
  const input = body.data.project;

  const userIntent: Intent = "global.createProject";

  // Is the user allowed to create new projects?
  await throwIfUnauthorized(req.user, userIntent, await Global.oldGetPermissions(multichain));

  // Max. length of projectId is 32
  // By converting to hex, each byte is represented by 2 characters
  // Therefore it should be called with an input length of 16
  const projectId = value("id", input.id || randomString(), isNonemptyString);

  // check if projectId already exists
  const projects = await Project.get(multichain, req.user);
  if (!isEmpty(projects.filter(p => p.data.id === projectId))) {
    throw { kind: "ProjectIdAlreadyExists", projectId } as ProjectIdAlreadyExistsError;
  }

  const ctime = new Date();

  const project: Project.Data = {
    id: projectId,
    creationUnixTs: ctime.getTime().toString(),
    status: value("status", input.status, x => ["open", "closed"].includes(x), "open"),
    displayName: value("displayName", input.displayName, isNonemptyString),
    description: value("description", input.description, isNonemptyString),
    amount: value("amount", input.amount, isNonemptyString),
    assignee: value("assignee", input.assignee, isUserOrUndefined, req.user.userId),
    currency: value("currency", input.currency, isNonemptyString).toUpperCase(),
    thumbnail: value("thumbnail", input.thumbnail, x => typeof x === "string", ""),
  };

  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: ctime,
    dataVersion: 1,
    data: {
      project,
      permissions: getProjectDefaultPermissions(req.user),
    },
  };

  await Project.publish(multichain, projectId, event);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        created: true,
      },
    },
  ];
}

function getProjectDefaultPermissions(token: AuthToken): AllowedUserGroupsByIntent {
  if (token.userId === "root") return {};

  const intents: Intent[] = [
    "project.viewSummary",
    "project.viewDetails",
    "project.assign",
    "project.update",
    "project.intent.listPermissions",
    "project.intent.grantPermission",
    "project.intent.revokePermission",
    "project.createSubproject",
    "project.viewHistory",
    "project.close",
  ];
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [token.userId] }), {});
}
