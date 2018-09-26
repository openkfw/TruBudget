import * as Global from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { GroupAlreadyExistsError } from "../error";
import * as Group from "../group";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";
import { isNonemptyString, isObject, value } from "../lib/validation";
import { MultichainClient } from "../multichain";

export const createGroup = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const data = value("data", req.body.data, isObject);
  const groupFromRequest = value("data.group", data.group, isObject);
  const groupId = value("id", groupFromRequest.id, isNonemptyString);
  const displayName = value("displayName", groupFromRequest.displayName, isNonemptyString);
  const users = value("users", groupFromRequest.users, Array.isArray);
  const userIntent: Intent = "global.createGroup";
  // Is the user allowed to create new projects?
  await throwIfUnauthorized(req.user, userIntent, await Global.getPermissions(multichain));
  const ctime = new Date();
  const group: Group.GroupResource = {
    groupId,
    displayName,
    users,
  };

  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: ctime,
    dataVersion: 1,
    data: {
      group,
    },
  };
  if (await Group.groupExists(multichain, groupId)) {
    throw { kind: "GroupAlreadyExists", targetGroupId: req.user.userId } as GroupAlreadyExistsError;
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
