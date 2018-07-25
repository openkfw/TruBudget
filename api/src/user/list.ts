import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { MultichainClient } from "../multichain";
import * as User from ".";
import * as Group from "../group/index";

export const getUserList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const users = await User.getAll(multichain);
  const groups = await Group.getAll(multichain);

  // users are not filtered for now (user.list and user.view is always allowed)

  const passwordlessUsers = users.map(user => ({
    id: user.id,
    displayName: user.displayName,
    organization: user.organization,
  }));

  const filteredGroups = groups.map(group => ({
    id: group.groupId,
    displayName: group.displayName,
    isGroup: true,
  }));

  return [
    200,
    {
      apiVersion: "1.0",
      data: { items: [...passwordlessUsers, ...filteredGroups] },
    },
  ];
};
