import { Ctx } from "../lib/ctx";
import { encrypt } from "../lib/symmetricCrypto";
import { getOrganizationAddress } from "../organization/organization";
import { hashPassword } from "../user/password";
import { ConnToken } from "./conn";
import { createkeypairs } from "./createkeypairs";
import * as AuthToken from "./domain/organization/auth_token";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserCreate from "./domain/organization/user_create";
import { sourceUserRecords } from "./domain/organization/user_eventsourcing";
import { getGlobalPermissions } from "./global_permissions_get";
import * as GroupQuery from "./group_query";
import { store } from "./store";
import { userExists } from "./user_query";

export async function createUser(
  organizationSecret: string,
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: UserCreate.RequestData,
): Promise<AuthToken.AuthToken> {
  const { newEvents, errors } = await UserCreate.createUser(ctx, serviceUser, requestData, {
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    userExists: async userId => userExists(conn, ctx, serviceUser, userId),
    createKeyPair: async () => createkeypairs(conn.multichainClient),
    hash: async plaintext => hashPassword(plaintext),
    encrypt: async plaintext => encrypt(organizationSecret, plaintext),
  });
  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  const { users } = sourceUserRecords(ctx, newEvents);
  if (users.length !== 1) {
    throw new Error(`Expected new events to yield exactly one user, got: ${JSON.stringify(users)}`);
  }
  const token = await AuthToken.fromUserRecord(users[0], {
    getGroupsForUser: async userId => {
      const groups = await GroupQuery.getGroupsForUser(conn, ctx, serviceUser, userId);
      return groups.map(group => group.id);
    },
    getOrganizationAddress: async organization => {
      const address = await getOrganizationAddress(conn.multichainClient, organization);
      if (address === undefined) {
        throw new Error(`Could not find address for organization "${organization}"`);
      }
      return address;
    },
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
  });
  return token;
}
