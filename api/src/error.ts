import { AuthenticationError, UserAlreadyExistsError } from "./user/model.h";
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

// For documentation, all custom error types should go in here:
export type TruBudgetError =
  | AuthenticationError
  | UserAlreadyExistsError
  | NotAuthorizedError
  | ParseError
  | NotFoundError;
