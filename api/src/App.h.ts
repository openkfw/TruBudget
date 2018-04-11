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
