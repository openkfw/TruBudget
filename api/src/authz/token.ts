import { findBadKeysInObject, isNonemptyString } from "../lib";

export interface AuthToken {
  userId: string;
  organization: string;
}
