import { VError } from "verror";
import { ConnToken } from ".";
import { globalIntents } from "../authz/intents";
import { config } from "../config";
import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as SymmetricCrypto from "../lib/symmetricCrypto";
import { getOrganizationAddress } from "../organization/organization";
import * as Result from "../result";
import { NotAuthorized } from "./domain/errors/not_authorized";
import * as AuthToken from "./domain/organization/auth_token";
import { getGroupsForUser } from "./domain/organization/group_query";
import * as UserQuery from "./domain/organization/user_query";
import { AuthenticationFailed } from "./errors/authentication_failed";
import { getselfaddress } from "./getselfaddress";
import { getGlobalPermissions } from "./global_permissions_get";
import { grantpermissiontoaddress } from "./grantpermissiontoaddress";
import { importprivkey } from "./importprivkey";
import { hashPassword, isPasswordMatch } from "./password";
import { decryptToken, getKeyStore, verifyToken } from "../lib/token";
import { UserMetadata } from "./domain/metadata";

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
  logger.debug({ userId, organization }, "Authenticating user");
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
  logger.debug("Authenticating Root user");

  if (typeof conn.multichainClient === "undefined") {
    logger.error("Received request, but MultiChain connection/permissions not ready yet.");
    return new AuthenticationFailed(
      { ctx, organization, userId: "root" },
      "Received request, but MultiChain connection/permissions not ready yet.",
    );
  }
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
  const rootAddress =
    config.signingMethod === "user"
      ? await getselfaddress(conn.multichainClient)
      : organizationAddress;

  return {
    userId: "root",
    displayName: "root",
    address: rootAddress,
    groups: [],
    organization,
    organizationAddress,
    allowedIntents: globalIntents,
  };
}

export async function authenticateUser(
  conn: ConnToken,
  ctx: Ctx,
  organization: string,
  organizationSecret: string,
  userId: string,
  password: string,
): Promise<Result.Type<AuthToken.AuthToken>> {
  // Use root as the service user to ensure we see all the data:
  const nodeAddress = await getselfaddress(conn.multichainClient);
  const rootUser = { id: "root", groups: [], address: nodeAddress };

  const userRecord = await UserQuery.getUser(conn, ctx, rootUser, userId);
  if (Result.isErr(userRecord)) {
    return new AuthenticationFailed({ ctx, organization, userId }, userRecord);
  }

  if (!(await isPasswordMatch(password, userRecord.passwordHash))) {
    return new AuthenticationFailed({ ctx, organization, userId });
  }

  // Check if user has user.authenticate intent
  const canAuthenticate =
    userRecord?.permissions["user.authenticate"] &&
    userRecord?.permissions["user.authenticate"].some((id) => id === userId);

  if (!canAuthenticate) {
    return new NotAuthorized({ ctx, userId, intent: "user.authenticate" });
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
  if (config.signingMethod === "user") {
    const userAddressPermissions: string[] = ["send"];
    await grantpermissiontoaddress(
      conn.multichainClient,
      userRecord.address,
      userAddressPermissions,
    );
  }
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

export async function authenticateWithToken(
  organization: string,
  organizationSecret: string,
  rootSecret: string,
  conn: ConnToken,
  ctx: Ctx,
  token: string,
  csrf: string,
): Promise<Result.Type<AuthToken.AuthToken>> {
  logger.debug({ organization }, "Authenticating user with token");
  // The special "root" user is not on the chain:
  // TODO add config check
  const base64SigningKey = config.authBuddy.jwsSignature as string;
  const keystore = await getKeyStore(
    Buffer.from(config.authBuddy.jwkKeystore as string, "base64").toString(),
  );
  const decryptedToken = await decryptToken(token, keystore);

  // verify JWS
  const verifiedToken = verifyToken(decryptedToken, Buffer.from(base64SigningKey, "base64"));

  // extract metadata
  const body = verifiedToken?.body.toJSON();
  const userId = body?.userId as string;
  const externalId = (body?.externalId as string) || "";
  const kid = (body?.kid as string) || "";
  const csrfFromCookie = body?.csrf as string;

  // cookie value does not match with value from http request params
  if (csrfFromCookie !== csrf) {
    return new NotAuthorized(
      { ctx, userId, intent: "user.authenticate" },
      new VError("CSRF protection"),
    );
  }

  // disable proxy login for "root"
  if (userId === "root") {
    return new NotAuthorized({ ctx, userId, intent: "user.authenticate" });
  }

  const metadata: UserMetadata = { externalId, kid };

  // Use root as the service user to ensure we see all the data:
  const nodeAddress = await getselfaddress(conn.multichainClient);
  const rootUser = { id: "root", groups: [], address: nodeAddress };

  const userRecord = await UserQuery.getUser(conn, ctx, rootUser, userId);
  if (Result.isErr(userRecord)) {
    return new AuthenticationFailed({ ctx, organization, userId }, userRecord);
  }

  // Check if user has user.authenticate intent
  const canAuthenticate =
    userRecord?.permissions["user.authenticate"] &&
    userRecord?.permissions["user.authenticate"].some((id) => id === userId);

  if (!canAuthenticate) {
    return new NotAuthorized({ ctx, userId, intent: "user.authenticate" });
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
  if (config.signingMethod === "user") {
    const userAddressPermissions: string[] = ["send"];
    await grantpermissiontoaddress(
      conn.multichainClient,
      userRecord.address,
      userAddressPermissions,
    );
  }
  const authTokenResult = AuthToken.fromUserRecord(
    userRecord,
    {
      getGroupsForUser: async (id) => {
        const groupsResult = await getGroupsForUser(conn, ctx, rootUser, id);
        if (Result.isErr(groupsResult)) {
          return new VError(groupsResult, `fetch groups for user ${id} failed`);
        }
        return groupsResult.map((group) => group.id);
      },
      getOrganizationAddress: async (orga) => getOrganizationAddressOrError(conn, ctx, orga),
      getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, rootUser),
    },
    metadata,
  );

  return Result.mapErr(
    authTokenResult,
    (err) => new VError(err, `token authentication failed for ${userId}`),
  );
}
