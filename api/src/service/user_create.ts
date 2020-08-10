import { VError } from "verror";
import { Ctx } from "../lib/ctx";
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
): Promise<Result.Type<AuthToken.AuthToken>> {
  const newEventsResult = await UserCreate.createUser(ctx, serviceUser, requestData, {
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    userExists: async (userId) => userExists(conn, ctx, serviceUser, userId),
    organizationExists: async (organization) =>
      organizationExists(conn.multichainClient, organization),
    createKeyPair: async () => createkeypairs(conn.multichainClient),
    hash: async (plaintext) => hashPassword(plaintext),
    encrypt: async (plaintext) => encrypt(organizationSecret, plaintext),
  });
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `failed to create user`);
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  const { users } = sourceUserRecords(ctx, newEvents);
  if (users.length !== 1) {
    return new Error(
      `Expected new events to yield exactly one user, got: ${JSON.stringify(users)}`,
    );
  }
  const token = await AuthToken.fromUserRecord(users[0], {
    getGroupsForUser: async (userId) => {
      const groupsResult = await GroupQuery.getGroupsForUser(conn, ctx, serviceUser, userId);
      if (Result.isErr(groupsResult)) {
        return new VError(groupsResult, `fetch groups for user ${userId} failed`);
      }
      return groupsResult.map((group) => group.id);
    },
    getOrganizationAddress: async (organization) =>
      getOrganizationAddressOrError(conn, ctx, organization),
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
  });
  return token;
}

async function getOrganizationAddressOrError(
  conn: ConnToken,
  ctx: Ctx,
  organization: string,
): Promise<Result.Type<string>> {
  const organizationAddress = await getOrganizationAddress(conn.multichainClient, organization);
  if (!organizationAddress) {
    return new VError(
      { info: { ctx, organization } },
      `No organization address found for ${organization}`,
    );
  }
  return organizationAddress;
}
