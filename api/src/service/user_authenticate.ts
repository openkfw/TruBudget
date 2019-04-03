import { VError } from "verror";

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
    token = await authenticateRoot(conn, ctx, organization, rootSecret, password);
  } else {
    token = await authenticateUser(conn, ctx, organization, organizationSecret, userId, password);
  }

  return token;
}

async function authenticateRoot(
  conn: ConnToken,
  ctx: Ctx,
  organization: string,
  rootSecret: string,
  password: string,
): Promise<AuthToken.AuthToken> {
  // Prevent timing attacks by using the constant-time compare function
  // instead of simple string comparison:
  const rootSecretHash = await hashPassword(rootSecret);
  if (!(await isPasswordMatch(password, rootSecretHash))) {
    throw new AuthenticationFailed({ ctx, organization, userId: "root" });
  }

  try {
    const organizationAddress = await getOrganizationAddressOrThrow(conn, ctx, organization);

    return {
      userId: "root",
      displayName: "root",
      address: organizationAddress,
      groups: [],
      organization,
      organizationAddress,
      allowedIntents: globalIntents,
    };
  } catch (error) {
    throw new AuthenticationFailed({ ctx, organization, userId: "root" }, error);
  }
}

async function authenticateUser(
  conn: ConnToken,
  ctx: Ctx,
  organization: string,
  organizationSecret: string,
  userId: string,
  password: string,
): Promise<AuthToken.AuthToken> {
  const userRecord = await UserQuery.getUser(conn, ctx, rootUser, userId);
  if (Result.isErr(userRecord)) {
    throw new AuthenticationFailed({ ctx, organization, userId }, userRecord);
  }

  if (!(await isPasswordMatch(password, userRecord.passwordHash))) {
    throw new AuthenticationFailed({ ctx, organization, userId });
  }

  // Every user has an address and an associated private key. Importing the private key
  // when authenticating a user allows users to roam freely between nodes of their
  // organization.
  const privkey = SymmetricCrypto.decrypt(organizationSecret, userRecord.encryptedPrivKey);
  if (Result.isErr(privkey)) {
    const cause = new VError(
      privkey,
      "failed to decrypt the user's private key with the given organization secret " +
        `(does "${userId}" belong to "${organization}"?)`,
    );
    throw new AuthenticationFailed({ ctx, organization, userId }, cause);
  }
  await importprivkey(conn.multichainClient, privkey, userRecord.id);

  try {
    return AuthToken.fromUserRecord(userRecord, {
      getGroupsForUser: async id =>
        getGroupsForUser(conn, ctx, rootUser, id).then(groups => groups.map(x => x.id)),
      getOrganizationAddress: async orga => getOrganizationAddressOrThrow(conn, ctx, orga),
      getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, rootUser),
    });
  } catch (error) {
    throw new AuthenticationFailed({ ctx, organization, userId }, error);
  }
}

async function getOrganizationAddressOrThrow(
  conn: ConnToken,
  ctx: Ctx,
  organization: string,
): Promise<string> {
  const organizationAddress = await getOrganizationAddress(conn.multichainClient, organization);
  if (!organizationAddress) {
    throw new VError(
      { info: { ctx, organization } },
      `No organization address found for ${organization}`,
    );
  }
  return organizationAddress;
}
