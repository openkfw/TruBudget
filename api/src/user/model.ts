import * as jsonwebtoken from "jsonwebtoken";

import { AllowedUserGroupsByIntent } from "../authz/types";
import {
  MultichainClient,
  Stream,
  StreamBody,
  StreamItem,
  StreamTxId,
  GlobalOnChain
} from "../multichain";
import {
  UserRecord,
  UserLoginResponse,
  NewUser,
  UserCreationResponse,
  UserListResponse,
  UserListResponseItem
} from "./model.h";
import { encryptPassword } from "./hash";
import { findBadKeysInObject, isNonemptyString } from "../lib";
import { globalIntents, userDefaultIntents } from "../authz/intents";
import Intent from "../authz/intents";
import { getAllowedIntents } from "../authz/index";
const usersStream = "users";

const createToken = (secret: string) => (userId: string, organization: string): string =>
  jsonwebtoken.sign({ userId, organization }, secret, { expiresIn: "1h" });

export class UserModel {
  multichain: MultichainClient;
  rootSecret: string;
  createToken: (userId: string, organization: string) => string;

  constructor(multichain: MultichainClient, jwtSecret: string, rootSecret: string) {
    this.multichain = multichain;
    this.rootSecret = rootSecret;
    this.createToken = createToken(jwtSecret);
  }

  /*
   * Create a new user if the user ID is available.
   *
   * 1. does user stream exist?
   * 2. does user exist in stream? (as key = userid)
   * 3. add user to stream
   * 4. return user id
   */
  async create(input, authorized): Promise<UserCreationResponse> {
    const expectedKeys = ["id", "displayName", "organization", "password"];
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, input);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };
    const newUser: NewUser = {
      id: input.id,
      displayName: input.displayName,
      organization: input.organization,
      passwordPlaintext: input.password
    };

    // Make sure nobody creates the special "root" user:
    if (newUser.id === "root") throw { kind: "UserAlreadyExists", targetUserId: "root" };

    /* TODO root permissions */
    const rootPermissions = new Map<string, string[]>();
    await authorized(rootPermissions); // throws if unauthorized

    const streamTxId: StreamTxId = await this.multichain.getOrCreateStream({
      kind: "users",
      name: usersStream
    });

    const userExists = await this.multichain
      .latestValuesForKey(streamTxId, newUser.id)
      .then(values => values.length !== 0);

    if (userExists) throw { kind: "UserAlreadyExists", targetUserId: newUser.id };
    console.log(`Creating new user ${newUser.id}..`);

    const userRecord: UserRecord = {
      id: newUser.id,
      displayName: newUser.displayName,
      organization: newUser.organization,
      allowedIntents: userDefaultIntents,
      passwordCiphertext: await encryptPassword(newUser.passwordPlaintext),
      permissions: [["user.view", [newUser.id]] as any]
    };
    await this.multichain.updateStreamItem(streamTxId, userRecord.id, userRecord);
    console.log(`Created new user ${userRecord.id} on stream "${streamTxId}"`);
    return {
      id: userRecord.id,
      displayName: userRecord.displayName,
      organization: userRecord.organization,
      allowedIntents: userRecord.allowedIntents
    };
  }

  async list(token, authorized, globalModel): Promise<UserListResponse> {
    const users: UserRecord[] = (await this.multichain.streamItems(usersStream)).map(
      item => item.value
    );

    const clearedUsers = (await Promise.all(
      users.map(user => {
        return authorized(user.permissions)
          .then(() => user)
          .catch(err => null);
      })
    )).filter(x => x !== null) as UserRecord[];

    return {
      items: clearedUsers
    };
  }

  /*
   * Get an authentication token for a user.
   *
   * Throws:
   *  - ParseError on invalid input
   *  - AuthenticationError if the username is not found or the password is wrong
   */
  async authenticate(input, globalModel): Promise<UserLoginResponse> {
    const expectedKeys = ["id", "password"];
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, input);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };
    const { id, password: passwordCleartext } = input;

    // The client shouldn't be able to distinguish between a wrong id and a wrong password,
    // so we handle all errors alike:
    const throwError = err => {
      console.log(`Authentication failed: ${err}`);
      throw { kind: "AuthenticationError", userId: id };
    };

    // The special "root" user is not on the chain:
    if (id === "root") {
      if (passwordCleartext === this.rootSecret) {
        return rootUserLoginResponse(this.createToken("root", "root"));
      } else {
        throwError("wrong password");
      }
    }
    const values: UserRecord[] = await this.multichain
      .latestValuesForKey(usersStream, id)
      .catch(throwError);
    if (values.length === 0) throwError("user not found");
    const trueUser = values[0];
    const passwordCiphertext = await encryptPassword(passwordCleartext);
    const isPasswordMatch = passwordCiphertext === trueUser.passwordCiphertext;
    if (!isPasswordMatch) throwError("wrong password");
    const token = { userId: trueUser.id, organization: trueUser.organization };
    return {
      id,
      displayName: trueUser.displayName,
      organization: trueUser.organization,
      allowedIntents: await getAllowedIntents(token, GlobalOnChain.getPermissions(this.multichain)),
      token: this.createToken(id, trueUser.organization)
    };
  }
}

const rootUserLoginResponse = (token: string): UserLoginResponse => ({
  id: "root",
  displayName: "root",
  organization: "root",
  allowedIntents: globalIntents,
  token
});
