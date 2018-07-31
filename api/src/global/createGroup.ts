import * as Global from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import * as Group from "../group";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";
import { isNonemptyString, isObject, value } from "../lib/validation";
import { MultichainClient } from "../multichain";

export const createGroup = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  let input;
  if (isObject(req.body.data && isObject(req.body.data.group))) {
    input = value("data.group", req.body.data.group, x => x !== undefined);
  }
  const groupId = value("id", input.id, isNonemptyString);
  const displayName = value("displayName", input.displayName, isNonemptyString);
  let users;
  if (input.users.isArray) {
    users = value("users", input.users, x => x !== undefined);
  }
  const userIntent: Intent = "global.createGroup";
  // Is the user allowed to create new projects?
  await throwIfUnauthorized(req.token, userIntent, await Global.getPermissions(multichain));
  const ctime = new Date();
  const group: Group.GroupResource = {
    groupId,
    displayName,
    users,
  };

  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: ctime,
    dataVersion: 1,
    data: {
      group,
    },
  };
  if (await Group.groupExists(multichain, groupId)) {
    throw { kind: "GroupAlreadyExists", targetUserId: req.token.userId };
  }

  await Group.publish(multichain, groupId, event);
  logger.info(event, "Group created.");

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
