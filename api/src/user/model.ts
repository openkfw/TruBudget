import * as jsonwebtoken from "jsonwebtoken";

import { ListProjects } from "../authz/intents";
import { ModelResult, AllowedUserGroupsByIntent } from "../authz/types";
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

const usersStream = "users";

const isNonemptyString = (x: any): boolean => typeof x === "string" && x.length > 0;
const findMissingKeys = (expectedKeys: string[], maybeUser: any): string[] =>
  expectedKeys.filter(key => typeof maybeUser !== "object" || !isNonemptyString(maybeUser[key]));

export class UserModel {
  multichain: MultichainClient;
  jwtSecret: string;
  constructor(multichain: MultichainClient, jwtSecret: string) {
    this.multichain = multichain;
    this.jwtSecret = jwtSecret;
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
    const missingKeys = findMissingKeys(expectedKeys, input);
    if (missingKeys.length > 0) throw { kind: "MissingKeys", missingKeys };
    const newUser = input as User;

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
    const missingKeys = findMissingKeys(expectedKeys, input);
    if (missingKeys.length > 0) throw { kind: "MissingKeys", missingKeys };
    const { id, password } = input;

    // The client shouldn't be able to distinguish between a wrong id and a wrong password,
    // so we handle all errors alike:
    const handleError = err => {
      console.log(`Authentication failed: ${err}`);
      throw { kind: "AuthenticationError", userId: id };
    };

    const item: StreamItem = await this.multichain.streamItem(usersStream, id).catch(handleError);
    console.log(JSON.stringify(item));
    const trueUser = item.value as User;

    const passwordHash = await createPasswordHash(password);
    const isPasswordMatch = passwordHash === trueUser.password;
    if (!isPasswordMatch) handleError("wrong password");

    const jwt = jsonwebtoken.sign({ user: id }, this.jwtSecret, { expiresIn: "1h" });

    return jwt;
  }
}
