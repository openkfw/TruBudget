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
): Promise<Result.Type<AuthToken.AuthToken>> {
  // The special "root" user is not on the chain:
  if (userId === "root") {
    const tokenResult = await authenticateRoot(conn, ctx, organization, rootSecret, password);
    return Result.mapErr(tokenResult, (err) => new VError(err, "root authentication failed"));
  } else {
    const tokenResult = await authenticateUser(
      conn,
      ctx,
      organization,
      organizationSecret,
      userId,
      password,
    );
    return Result.mapErr(
      tokenResult,
      (err) => new VError(err, `authentication failed for ${userId}`),
    );
  }
}

async function authenticateRoot(
  conn: ConnToken,
  ctx: Ctx,
  organization: string,
  rootSecret: string,
  password: string,
): Promise<Result.Type<AuthToken.AuthToken>> {
  // Prevent timing attacks by using the constant-time compare function
  // instead of simple string comparison:
  const rootSecretHash = await hashPassword(rootSecret);
  if (!(await isPasswordMatch(password, rootSecretHash))) {
    return new AuthenticationFailed({ ctx, organization, userId: "root" });
  }

  const organizationAddressResult = await getOrganizationAddressOrError(conn, ctx, organization);
  if (Result.isErr(organizationAddressResult)) {
    return new AuthenticationFailed({ ctx, organization, userId: "root" });
  }
  const organizationAddress = organizationAddressResult;

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
  organization: string,
  organizationSecret: string,
  userId: string,
  password: string,
): Promise<Result.Type<AuthToken.AuthToken>> {
  const userRecord = await UserQuery.getUser(conn, ctx, rootUser, userId);
  if (Result.isErr(userRecord)) {
    return new AuthenticationFailed({ ctx, organization, userId }, userRecord);
  }

  if (!(await isPasswordMatch(password, userRecord.passwordHash))) {
    return new AuthenticationFailed({ ctx, organization, userId });
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
    return new AuthenticationFailed({ ctx, organization, userId }, cause);
  }
  await importprivkey(conn.multichainClient, privkey, userRecord.id);

  const authTokenResult = AuthToken.fromUserRecord(userRecord, {
    getGroupsForUser: async (id) => {
      const groupsResult = await getGroupsForUser(conn, ctx, rootUser, id);
      if (Result.isErr(groupsResult)) {
        return new VError(groupsResult, `fetch groups for user ${id} failed`);
      }
      return groupsResult.map((group) => group.id);
    },
    getOrganizationAddress: async (orga) => getOrganizationAddressOrError(conn, ctx, orga),
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, rootUser),
  });

  return Result.mapErr(
    authTokenResult,
    (error) => new AuthenticationFailed({ ctx, organization, userId }, error),
  );
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
