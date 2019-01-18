import { MultichainClient } from "./multichain/Client.h";
import * as Group from "./multichain/groups";
import * as Notification from "./notification";

export function create(multichainClient: MultichainClient): Notification.GroupResolverPort {
  return groupId => Group.getUsers(this.multichainClient, groupId);
}
