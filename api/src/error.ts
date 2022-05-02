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
    super(`An error occured ${err.kind}, details: ${JSON.stringify(err)}`);
    Object.setPrototypeOf(this, TruBudgetError.prototype);
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
