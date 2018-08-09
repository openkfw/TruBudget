import * as Group from "../../group";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import * as User from "../model/user";

export const getUserList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const users = await User.getAll(multichain);
  const groups = await Group.getAll(multichain);

  // users are not filtered for now (user.list and user.view is always allowed)

  const usersWithoutPasswords = users.map(user => ({
    id: user.id,
    displayName: user.displayName,
    organization: user.organization,
  }));

  const groupsWithoutUsers = groups.map(group => ({
    id: group.groupId,
    displayName: group.displayName,
    isGroup: true,
  }));

  return [
    200,
    {
      apiVersion: "1.0",
      data: { items: [...usersWithoutPasswords, ...groupsWithoutUsers] },
    },
  ];
};
