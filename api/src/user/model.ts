import * as jsonwebtoken from "jsonwebtoken";

import { AllowedUserGroupsByIntent } from "../authz/types";
import {
  MultichainClient,
  ProjectStreamMetadata,
  Stream,
  StreamBody,
  StreamItem,
  StreamTxId
} from "../multichain";
import { TrubudgetError } from "../App.h";
import { User } from "./model.h";
import { createPasswordHash } from "./hash";
import { findBadKeysInObject, isNonemptyString } from "../lib";

const usersStream = "users";

const createToken = (secret: string) => (userId: string): string =>
  jsonwebtoken.sign({ user: userId }, secret, { expiresIn: "1h" });

export class UserModel {
  multichain: MultichainClient;
  rootSecret: string;
  createToken: (userId: string) => string;

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
  async create(input, authorized): Promise<string | TrubudgetError> {
    const expectedKeys = ["id", "displayName", "organization", "password"];
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, input);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };
    const newUser = input as User;

    // Make sure nobody creates the special "root" user:
    if (newUser.id === "root") throw { kind: "UserAlreadyExists", targetUserId: "root" };

    /* TODO root permissions */
    const rootPermissions = new Map<string, string[]>();
    await authorized(rootPermissions); // throws if unauthorized

    const issuer = "alice";
    const streamTxId: StreamTxId = await this.multichain.createStream({
      kind: "users",
      name: usersStream,
      initialLogEntry: { issuer, action: "stream created" }
    });

    const userExists = await this.multichain
      .streamItem(streamTxId, newUser.id)
      .then(_item => true)
      .catch(err => {
        console.log(`User not found (so we'll create it): ${err}`);
        return false;
      });
    console.log(`User exists: ${userExists}`);

    if (userExists) throw { kind: "UserAlreadyExists", targetUserId: newUser.id };

    newUser.password = await createPasswordHash(newUser.password);
    await this.multichain.updateStreamItem(streamTxId, newUser.id, newUser);
    console.log(`${issuer} has created a new user on stream "${streamTxId}"`);
    return newUser.id;
  }

  async authenticate(input): Promise<string | TrubudgetError> {
    const expectedKeys = ["id", "password"];
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, input);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };
    const { id, password } = input;

    // The client shouldn't be able to distinguish between a wrong id and a wrong password,
    // so we handle all errors alike:
    const throwError = err => {
      console.log(`Authentication failed: ${err}`);
      throw { kind: "AuthenticationError", userId: id };
    };

    // The special "root" user is not on the chain:
    if (id === "root") {
      if (password === this.rootSecret) {
        return this.createToken("root");
      } else {
        throwError("wrong password");
      }
    }

    const item: StreamItem = await this.multichain.streamItem(usersStream, id).catch(throwError);
    console.log(JSON.stringify(item));
    const trueUser = item.value as User;

    const passwordHash = await createPasswordHash(password);
    const isPasswordMatch = passwordHash === trueUser.password;
    if (!isPasswordMatch) throwError("wrong password");

    return this.createToken(id);
  }
}
