import { ConnToken } from ".";
import { globalIntents } from "../authz/intents";
import { Ctx } from "../lib/ctx";
import * as SymmetricCrypto from "../lib/symmetricCrypto";
import { getOrganizationAddress } from "../organization/organization";
import * as Result from "../result";
import * as AuthToken from "./domain/organization/auth_token";
import { AuthenticationFailed } from "./errors/authentication_failed";
import { getGlobalPermissions } from "./global_permissions_get";
import { getGroupsForUser } from "./group_query";
import { importprivkey } from "./importprivkey";
import { hashPassword, isPasswordMatch } from "./password";
import * as UserQuery from "./user_query";

// Use root as the service user to ensure we see all the data:
const rootUser = { id: "root", groups: [] };

export interface UserLoginResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
  groups: object[];
  token: string;
}

export async function authenticate(
  organization: string,
  organizationSecret: string,
  rootSecret: string,
  conn: ConnToken,
  ctx: Ctx,
  userId: string,
  password: string,
): Promise<AuthToken.AuthToken> {
  let token: AuthToken.AuthToken;

  // The special "root" user is not on the chain:
  if (userId === "root") {
    token = await authenticateRoot(conn, organization, rootSecret, password);
  } else {
    token = await authenticateUser(conn, ctx, organizationSecret, userId, password);
  }

  return token;
}

async function authenticateRoot(
  conn: ConnToken,
  organization: string,
  rootSecret: string,
  password: string,
): Promise<AuthToken.AuthToken> {
  // Prevent timing attacks by using the constant-time compare function
  // instead of simple string comparison:
  const rootSecretHash = await hashPassword(rootSecret);
  if (!(await isPasswordMatch(password, rootSecretHash))) {
    throw new AuthenticationFailed();
  }

  const organizationAddress = await getOrganizationAddressOrThrow(conn, organization);

  return {
    userId: "root",
    displayName: "root",
    address: organizationAddress,
    groups: [],
    organization,
    organizationAddress,
    allowedIntents: globalIntents,
  };
}

async function authenticateUser(
  conn: ConnToken,
  ctx: Ctx,
  organizationSecret: string,
  userId: string,
  password: string,
): Promise<AuthToken.AuthToken> {
  const userRecord = await UserQuery.getUser(conn, ctx, rootUser, userId);
  if (Result.isErr(userRecord)) {
    throw new AuthenticationFailed(userRecord.message);
  }

  if (!(await isPasswordMatch(password, userRecord.passwordHash))) {
    throw new AuthenticationFailed();
  }

  // Every user has an address and an associated private key. Importing the private key
  // when authenticating a user allows users to roam freely between nodes of their
  // organization.
  await importprivkey(
    conn.multichainClient,
    SymmetricCrypto.decrypt(organizationSecret, userRecord.encryptedPrivKey),
    userRecord.id,
  );

  return AuthToken.fromUserRecord(userRecord, {
    getGroupsForUser: async id =>
      getGroupsForUser(conn, ctx, rootUser, id).then(groups => groups.map(x => x.id)),
    getOrganizationAddress: async organization => getOrganizationAddressOrThrow(conn, organization),
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, rootUser),
  });
}

async function getOrganizationAddressOrThrow(
  conn: ConnToken,
  organization: string,
): Promise<string> {
  const organizationAddress = await getOrganizationAddress(conn.multichainClient, organization);
  if (!organizationAddress) {
    throw new AuthenticationFailed(`No organization address found for ${organization}`);
  }
  return organizationAddress;
}
