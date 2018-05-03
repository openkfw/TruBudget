import { throwIfUnauthorized } from "../authz/index";
import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent } from "../authz/types";
import * as Global from "../global";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain";
import { randomString } from "../multichain/hash";
import * as Project from "../project";

export const createProject = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data.project", req.body.data.project, x => x !== undefined);

  // Is the user allowed to create new projects?
  await throwIfUnauthorized(
    req.token,
    "global.createProject",
    await Global.getPermissions(multichain),
  );

  await Project.create(
    multichain,
    req.token,
    {
      id: value("id", input.id || randomString(), isNonemptyString),
      creationUnixTs: Date.now().toString(),
      status: value("status", input.status, x => ["open", "closed"].includes(x), "open"),
      displayName: value("displayName", input.displayName, isNonemptyString),
      description: value("description", input.description, isNonemptyString),
      amount: value("amount", input.amount, isNonemptyString),
      assignee: value("assignee", input.assignee, isNonemptyString),
      currency: value("currency", input.currency, isNonemptyString).toUpperCase(),
      thumbnail: value("thumbnail", input.thumbnail, x => typeof x === "string", ""),
    },
    defaultPermissions(req.token.userId),
  );

  console.log(
    `Project ${input.displayName} created with default permissions: ${JSON.stringify(
      defaultPermissions(req.token.userId),
    )}`,
  );

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        created: true,
      },
    },
  ];
};

const defaultPermissions = (userId: string): AllowedUserGroupsByIntent => {
  if (userId === "root") return {};

  const intents: Intent[] = [
    "project.viewSummary",
    "project.viewDetails",
    "project.assign",
    "project.intent.listPermissions",
    "project.intent.grantPermission",
    "project.intent.revokePermission",
    "project.createSubproject",
  ];
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [userId] }), {});
};
