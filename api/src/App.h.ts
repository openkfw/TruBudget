import { SimpleIntent } from "./authz/intents";
import { AuthToken } from "./authz/token";

export interface NotAuthorizedError {
  kind: "NotAuthorized";
  token: AuthToken;
  intent: SimpleIntent;
}

export interface UserAlreadyExistsError {
  kind: "UserAlreadyExists";
  targetUserId: string;
}

// Thrown on missing keys and invalid values:
export interface ParseError {
  kind: "ParseError";
  badKeys: string;
}

export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}

export type TrubudgetError =
  | NotAuthorizedError
  | UserAlreadyExistsError
  | ParseError
  | AuthenticationError;
