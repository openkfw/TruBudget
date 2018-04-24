import { NotAuthorizedError } from "./authz/types";

// Thrown on missing keys and invalid values:
export interface ParseError {
  kind: "ParseError";
  badKeys: string[];
}

export interface NotFoundError {
  kind: "NotFound";
  what: object;
}

export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}

export interface UserAlreadyExistsError {
  kind: "UserAlreadyExists";
  targetUserId: string;
}

// For documentation, all custom error types should go in here:
export type TruBudgetError =
  | AuthenticationError
  | UserAlreadyExistsError
  | NotAuthorizedError
  | ParseError
  | NotFoundError;
