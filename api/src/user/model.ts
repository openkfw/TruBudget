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

const isNonemptyString = (x: any): boolean => typeof x === "string" && x.length > 0;
const findMissingKeys = (maybeUser: any): string[] =>
  ["id", "displayName", "organization", "password"].filter(
    key => typeof maybeUser !== "object" || !isNonemptyString(maybeUser[key])
  );

export class UserModel {
  multichain: MultichainClient;
  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }

  /*
   * Create a new user if the user ID is available.
   *
   * 1. does user stream exist?
   * 2. does user exist in stream? (as key = userid)
   * 3. add user to stream
   * 4. return user id
   */
  create(input, authorized): Promise<string | TrubudgetError> {
    return new Promise((resolve, reject) => {
      const missingKeys = findMissingKeys(input);
      if (missingKeys.length > 0) return reject({ kind: "MissingKeys", missingKeys });
      const newUser = input as User;

      /* TODO root permissions */
      const rootPermissions = new Map<string, string[]>();
      authorized(rootPermissions)
        .then(async () => {
          const issuer = "alice";
          const streamTxId: StreamTxId = await this.multichain.createStream({
            kind: "users",
            name: "users",
            initialLogEntry: { issuer, action: "stream created" }
          });

          const userExists = await this.multichain
            .streamItem(streamTxId, newUser.id)
            .then((item: StreamItem) => {
              console.log(`Does user already exist? => ${JSON.stringify(item)}`);
              return item.items > 0;
            })
            .catch(err => {
              console.log(`User not found (so we'll create it): ${err}`);
              return false;
            });
          console.log(`User exists: ${userExists}`);

          if (userExists) {
            reject({ kind: "UserAlreadyExists", targetUserId: newUser.id });
          } else {
            await this.multichain.updateStreamItem(streamTxId, newUser.id, newUser);
            console.log(`${issuer} has created a new user on stream "${streamTxId}"`);
            resolve(newUser.id);
          }
        })
        .catch(err => reject(err));
    });
  }
}
