import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import { encrypt } from "../lib/symmetricCrypto";
import { getOrganizationAddress, organizationExists } from "../organization/organization";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { createkeypairs } from "./createkeypairs";
import * as AuthToken from "./domain/organization/auth_token";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserCreate from "./domain/organization/user_create";
import { sourceUserRecords } from "./domain/organization/user_eventsourcing";
import { getGlobalPermissions } from "./global_permissions_get";
import * as GroupQuery from "./group_query";
import { hashPassword } from "./password";
import { store } from "./store";
import { userExists } from "./user_query";

export async function createUser(
  organizationSecret: string,
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: UserCreate.RequestData,
): Promise<AuthToken.AuthToken> {
  const result = await UserCreate.createUser(ctx, serviceUser, requestData, {
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    userExists: async userId => userExists(conn, ctx, serviceUser, userId),
    organizationExists: async organization =>
      organizationExists(conn.multichainClient, organization),
    createKeyPair: async () => createkeypairs(conn.multichainClient),
    hash: async plaintext => hashPassword(plaintext),
    encrypt: async plaintext => encrypt(organizationSecret, plaintext),
  });
  if (Result.isErr(result)) return Promise.reject(result);
  if (!result.length) {
    const msg = "failed to create user";
    logger.error({ ctx, serviceUser, requestData }, msg);
    throw new Error(msg);
  }

  for (const event of result) {
    await store(conn, ctx, event);
  }

  const { users } = sourceUserRecords(ctx, result);
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
