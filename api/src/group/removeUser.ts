import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import * as Global from "../global";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import * as Group from "../group";

export async function removeUserFromGroup(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);
  const groupId: string = value("groupId", input.groupId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);
  const userIntent: Intent = "group.removeUser";
  const permissionIntent: Intent = "global.createGroup";
  await throwIfUnauthorized(req.token, permissionIntent, await Global.getPermissions(multichain));

  const groupExists = await Group.groupExists(multichain, groupId);

  if (!groupExists) {
    throw { kind: "NotFound", targetUserId: groupId };
  }
  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: {
      groupId,
      userId,
    },
  };

  await Group.publish(multichain, groupId, event);
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        deleted: true,
      },
    },
  ];
}
