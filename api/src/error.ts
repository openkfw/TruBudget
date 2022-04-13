import { NotAuthorizedError } from "./authz/types";
import { Event } from "./service/event";

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

export interface FileNotFoundError {
  kind: "FileNotFound";
  filePath: string;
}

export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}

export interface AddressIsInvalidError {
  kind: "AddressIsInvalid";
  address: string;
}
export interface IdentityAlreadyExistsError {
  kind: "IdentityAlreadyExists";
  targetId: string;
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

export interface UnsupportedEventVersion {
  kind: "UnsupportedEventVersion";
  event: Event;
}

export interface UnsupportedMediaType {
  kind: "UnsupportedMediaType";
  contentType: string;
}

// For documentation, all custom error types should go in here:
export type TruBudgetErrorType =
  | AuthenticationError
  | IdentityAlreadyExistsError
  | ProjectIdAlreadyExistsError
  | SubprojectIdAlreadyExistsError
  | NotAuthorizedError
  | ParseError
  | NotFoundError
  | PreconditionError
  | AddressIsInvalidError
  | UnsupportedEventVersion
  | UnsupportedMediaType;

// Custom Throwables here

export class TruBudgetError extends Error {
  constructor(msg: TruBudgetErrorType) {
    const { kind } = msg;
    super(`An error occured ${kind}, details: ${JSON.stringify(msg)}`);
  }
}
