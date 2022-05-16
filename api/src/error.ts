import { NotAuthorizedError } from "./authz/types";
import { Event } from "./service/event";

/**
 * Error type thrown on missing keys and invalid values:
 */
export interface ParseError {
  kind: "ParseError";
  badKeys: string[];
  message?: string;
}

/**
 * Error type thrown when an entity is not found
 */
export interface NotFoundError {
  kind: "NotFound";
  what: object;
}

/**
 * Error type thrown when a file is not found
 */
export interface FileNotFoundError {
  kind: "FileNotFound";
  filePath: string;
}

/**
 * Error type thrown when an error occurred during authentication
 */
export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}

/**
 * Error type thrown when an address is invalid
 */
export interface AddressIsInvalidError {
  kind: "AddressIsInvalid";
  address: string;
}

/**
 * Error type thrown when an identity already exists
 */
export interface IdentityAlreadyExistsError {
  kind: "IdentityAlreadyExists";
  targetId: string;
}

/**
 * Error type thrown when a subproject id already exists
 */
export interface SubprojectIdAlreadyExistsError {
  kind: "SubprojectIdAlreadyExists";
  subprojectId: string;
}

/**
 * Error type thrown when a project id already exists
 */
export interface ProjectIdAlreadyExistsError {
  kind: "ProjectIdAlreadyExists";
  projectId: string;
}

/**
 * Error type thrown when a precondition is not met
 */
export interface PreconditionError {
  kind: "PreconditionError";
  message: string;
}

/**
 * Error type thrown when an event version is not supported
 */
export interface UnsupportedEventVersion {
  kind: "UnsupportedEventVersion";
  event: Event;
}

/**
 * Error type thrown when a media type is not supported
 */
export interface UnsupportedMediaType {
  kind: "UnsupportedMediaType";
  contentType: string;
}

/**
 * Error type representing an internal TruBudget Error
 */
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

/**
 * Class representing a default TruBudget error
 */
export class TruBudgetError extends Error {
  public badKeys = undefined;

  public what = undefined;

  public filePath = undefined;

  public userId = undefined;

  public address = undefined;

  public targetId = undefined;

  public subprojectId = undefined;

  public projectId = undefined;

  public event = undefined;

  public contentType = undefined;

  public kind = undefined;

  constructor(err: TruBudgetErrorType) {
    super(`An error occurred ${err.kind}, details: ${JSON.stringify(err)}`);
    Object.setPrototypeOf(this, TruBudgetError.prototype);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const property = err as any;
    this.badKeys = property.badKeys;
    this.what = property.what;
    this.filePath = property.filePath;
    this.userId = property.userId;
    this.address = property.address;
    this.targetId = property.targetId;
    this.subprojectId = property.subprojectId;
    this.projectId = property.projectId;
    this.event = property.event;
    this.contentType = property.contentType;
    this.kind = property.kind;
  }
}
