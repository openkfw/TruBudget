import * as Group from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import * as Global from "../global";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, isObject, value } from "../lib/validation";
import { MultichainClient } from "../multichain";

export async function addUserToGroup(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = value("data", req.body.data, isObject);
  const groupId: string = value("groupId", input.groupId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);
  const userIntent: Intent = "group.addUser";
  const permissionIntent: Intent = "global.createGroup";
  await throwIfUnauthorized(req.user, permissionIntent, await Global.getPermissions(multichain));

  const groupExists = await Group.groupExists(multichain, groupId);

  if (!groupExists) {
    throw { kind: "NotFound", targetUserId: groupId };
  }
  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: {
      userId,
    },
  };

  await Group.publish(multichain, groupId, event);
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        added: true,
      },
    },
  ];
}
