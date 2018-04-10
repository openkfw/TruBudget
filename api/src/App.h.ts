import { SimpleIntent } from "./authz/intents";

export interface NotAuthorizedError {
  kind: "NotAuthorized";
  user: string;
  intent: SimpleIntent;
}

export interface UserAlreadyExistsError {
  kind: "UserAlreadyExists";
  targetUserId: string;
}

export interface MissingKeysError {
  kind: "MissingKeys";
  missingKeys: string;
}

export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}

export type TrubudgetError =
  | NotAuthorizedError
  | UserAlreadyExistsError
  | MissingKeysError
  | AuthenticationError;
