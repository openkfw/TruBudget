import * as jsonwebtoken from "jsonwebtoken";

import { AllowedUserGroupsByIntent } from "../authz/types";
import { MultichainClient, Stream, StreamBody, StreamItem, StreamTxId } from "../multichain";
import { UserRecord, UserLoginResponse, NewUser } from "./model.h";
import { encryptPassword } from "./hash";
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
  async create(input, authorized): Promise<string> {
    const expectedKeys = ["id", "displayName", "organization", "password"];
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, input);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };
    const newUser = input as NewUser;

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

    const userRecord = {
      id: newUser.id,
      displayName: newUser.displayName,
      organization: newUser.organization,
      passwordCiphertext: await encryptPassword(newUser.passwordPlaintext)
    };
    await this.multichain.updateStreamItem(streamTxId, userRecord.id, userRecord);
    console.log(`${issuer} has created a new user on stream "${streamTxId}"`);
    return userRecord.id;
  }

  async authenticate(input): Promise<UserLoginResponse> {
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
        return {
          id: "root",
          displayName: "root",
          organization: "root",
          token: this.createToken("root")
        };
      } else {
        throwError("wrong password");
      }
    }

    const item: StreamItem = await this.multichain.streamItem(usersStream, id).catch(throwError);
    console.log(JSON.stringify(item));
    const trueUser = item.value as UserRecord;

    const passwordCiphertext = await encryptPassword(passwordCleartext);
    const isPasswordMatch = passwordCiphertext === trueUser.passwordCiphertext;
    if (!isPasswordMatch) throwError("wrong password");

    return {
      id,
      displayName: trueUser.displayName,
      organization: trueUser.organization,
      token: this.createToken(id)
    };
  }
}
