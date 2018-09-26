import { NotAuthorizedError } from "./authz/types";

// Thrown on missing keys and invalid values:
export interface ParseError {
  kind: "ParseError";
  badKeys: string[];
  message?: string;
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

export interface GroupAlreadyExistsError {
  kind: "GroupAlreadyExists";
  targetGroupId: string;
}

export interface SubprojectIdAlreadyExistsError {
  kind: "SubprojectIdAlreadyExists";
  subprojectId: string;
}

export interface ProjectIdAlreadyExistsError {
  kind: "ProjectIdAlreadyExists";
  projectId: string;
}

export interface PreconditionError {
  kind: "PreconditionError";
  message: string;
}

// For documentation, all custom error types should go in here:
export type TruBudgetError =
  | AuthenticationError
  | UserAlreadyExistsError
  | GroupAlreadyExistsError
  | ProjectIdAlreadyExistsError
  | SubprojectIdAlreadyExistsError
  | NotAuthorizedError
  | ParseError
  | NotFoundError;
