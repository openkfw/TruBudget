import { getUsersForGroup } from "./group";
import { MultichainClient } from "./multichain/Client.h";
import { GroupResolver } from "./notification";

export class MultichainGroupResolver implements GroupResolver {
  constructor(private readonly multichainClient: MultichainClient) {}

  public resolveGroup(groupId: string): Promise<string[]> {
    return getUsersForGroup(this.multichainClient, groupId).catch(() => []);
  }
}
