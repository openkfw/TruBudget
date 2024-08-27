import * as Result from "../result";
import { File } from "./domain/document/document_upload";

type Base64String = string;

export interface Version {
  release: string;
  commit: string;
  buildTimeStamp: string;
}

export interface StorageObject {
  id: string;
  fileName: string;
  base64: Base64String;
  lastModified?: string;
}

export interface DeleteResponse {
  status: number;
}

export interface UploadResponse {
  id: string;
  secret: string;
}
export interface StorageServiceClientI {
  /**
   * Get readiness sattus of storage service
   *
   */
  isReady(): Promise<boolean>;
  /**
   * Get version of conncted storage service
   *
   */
  getVersion(): Promise<Version>;
  /**
   * @typedef {Object} File
   * @property {string} id - The unique identifier for the file.
   * @property {string} fileName - The name of the file.
   * @property {string} documentBase64 - The base64 encoded content of the file.
   * @property {string} [comment] - An optional comment about the file.
   */

  /**
   * Upload an object using the
   *
   * @param {File} file - File object containing id, fileName, documentBase64, and an optional comment.
   * @returns {Promise<Result.Type<UploadResponse>>} - A promise that resolves to the upload response.
   */
  uploadObject(file: File): Promise<Result.Type<UploadResponse>>;
  /**
   * Download an object using the matching secret
   *
   * @param id id of object stored
   * @param secret secret to access the object's data
   */
  downloadObject(id: string, secret: string): Promise<Result.Type<StorageObject>>;
  deleteObject(id: string, secret: string): Promise<Result.Type<DeleteResponse>>;
}
