import * as Result from "../result";

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
   * Upload an object using the
   *
   * @param id id of object
   * @param name name of object
   * @param data content of uploaded object base64 encoded
   */
  uploadObject(id: string, name: string, data: Base64String): Promise<Result.Type<UploadResponse>>;
  /**
   * Download an object using the matching secret
   *
   * @param id id of object stored
   * @param secret secret to access the object's data
   */
  downloadObject(id: string, secret: string): Promise<Result.Type<StorageObject>>;
  deleteObject(id: string, secret: string): Promise<Result.Type<DeleteResponse>>;
}
