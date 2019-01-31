import * as jsonwebtoken from "jsonwebtoken";
import { getAllowedIntents, getUserAndGroups } from "../../authz";
import { globalIntents } from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import * as Global from "../../global";
import * as Group from "../../group";
import { HttpResponse } from "../../httpd/lib";
import * as SymmetricCrypto from "../../lib/symmetricCrypto";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain/Client.h";
import { importprivkey } from "../../multichain/importprivkey";
import { WalletAddress } from "../../network/model/Nodes";
import { getOrganizationAddress } from "../../organization/organization";
import * as User from "../model/user";
import { UserRecord } from "../model/user";
import { hashPassword, isPasswordMatch } from "../password";

export interface UserLoginResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
  groups: object[];
  token: string;
}

export const authenticateUser = async (
  multichain: MultichainClient,
  req,
  jwtSecret: string,
  rootSecret: string,
  organization: string,
  organizationVaultSecret: string,
): Promise<HttpResponse> => {
  const input = value("data.user", req.body.data.user, x => x !== undefined);

  const id: string = value("id", input.id, isNonemptyString);
  const password: string = value("password", input.password, isNonemptyString);
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        user: await authenticate(
          multichain,
          jwtSecret,
          rootSecret,
          organization,
          organizationVaultSecret,
          id,
          password,
        ),
      },
    },
  ];
};

const authenticate = async (
  multichain: MultichainClient,
  jwtSecret: string,
  rootSecret: string,
  organization: string,
  organizationVaultSecret: string,
  id: string,
  password: string,
): Promise<UserLoginResponse> => {
  // The client shouldn't be able to distinguish between a wrong id and a wrong password,
  // so we handle all errors alike:
  const throwError = () => {
    throw { kind: "AuthenticationError", userId: id };
  };

  // The special "root" user is not on the chain:
  if (id === "root") {
    // Prevent timing attacks by using the constant-time compare function
    // instead of simple string comparison:
    const rootSecretHash = await hashPassword(rootSecret);
    if (await isPasswordMatch(password, rootSecretHash)) {
      return rootUserLoginResponse(multichain, jwtSecret, organization);
    } else {
      // wrong password
      throwError();
    }
  }
  const storedUser: UserRecord = await User.get(multichain, id).catch(err => {
    const message = "An error occured while getting user";
    if (err) {
      switch (err.kind) {
        case "NotFound":
          // User not found
          throwError();
        default:
          throw err;
      }
    } else {
      throw err;
    }
  });

  if (!(await isPasswordMatch(password, storedUser.passwordDigest))) {
    const message = "Wrong password entered";
    throwError();
  }
  // Every user has an address and an associated private key. Importing the private key
  // when authenticating a user allows users to roam freely between nodes of their
  // organization.
  await importprivkey(
    multichain,
    SymmetricCrypto.decrypt(organizationVaultSecret, storedUser.privkey),
    storedUser.id,
  );

  // The organizationAddress is used for querying network votes, for instance.
  const organizationAddress: WalletAddress = (await getOrganizationAddress(
    multichain,
    storedUser.organization,
  ))!;

  const userGroups = await Group.getGroupsForUser(multichain, storedUser.id);
  const groupIds = userGroups.map(group => group.groupId);

  const token: AuthToken = {
    userId: storedUser.id,
    address: storedUser.address,
    organization: storedUser.organization,
    organizationAddress,
    groups: groupIds,
  };

  const signedJwt = createToken(
    jwtSecret,
    id,
    storedUser.address,
    storedUser.organization,
    organizationAddress,
    groupIds,
  );
  const globalPermissions = await Global.oldGetPermissions(multichain);

  return {
    id,
    displayName: storedUser.displayName,
    organization: storedUser.organization,
    allowedIntents: getAllowedIntents(getUserAndGroups(token), globalPermissions),
    groups: userGroups,
    token: signedJwt,
  };
};

function createToken(
  secret: string,
  userId: string,
  address: string,
  organization: string,
  organizationAddress: string,
  groupIds: string[],
): string {
  return jsonwebtoken.sign(
    {
      userId,
      address,
      organization,
      organizationAddress,
      groups: groupIds,
    },
    secret,
    { expiresIn: "1h" },
  );
}

async function rootUserLoginResponse(
  multichain: MultichainClient,
  jwtSecret: string,
  organization: string,
): Promise<UserLoginResponse> {
  const userId = "root";
  const organizationAddress = await getOrganizationAddress(multichain, organization);
  if (!organizationAddress) {
    const message = `No organization address found for ${organization}`;
    throw Error(message);
  }
  const userAddress = organizationAddress;
  const [groups, groupIds] = [[], []];
  const token = createToken(
    jwtSecret,
    userId,
    userAddress,
    organization,
    organizationAddress,
    groupIds,
  );
  return {
    id: userId,
    displayName: "root",
    organization,
    allowedIntents: globalIntents,
    groups,
    token,
  };
}
