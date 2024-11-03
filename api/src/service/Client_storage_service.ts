import { performance } from "perf_hooks";

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { VError } from "verror";

import { config } from "../config";
import logger from "../lib/logger";
import { decrypt, encrypt } from "../lib/symmetricCrypto";
import * as Result from "../result";

import {
  DeleteResponse,
  StorageObject,
  StorageServiceClientI,
  UploadResponse,
  Version,
} from "./Client_storage_service.h";
import { File } from "./domain/document/document_upload";

interface UploadRequest {
  fileName: string;
  content: string;
  comment?: string;
}

export default class StorageServiceClient implements StorageServiceClientI {
  private axiosInstance: AxiosInstance;

  private timeStamp = 0;

  constructor(settings: AxiosRequestConfig) {
    logger.debug("Setting up StorageServiceClient");
    this.axiosInstance = axios.create(settings);
    this.axiosInstance.interceptors.request.use((request) => {
      if (request.url?.includes("/version")) {
        this.timeStamp = performance.now();
      }
      return request;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (response.config.url?.includes("/version")) {
          response.data.ping = performance.now() - this.timeStamp;
        }
        return response;
      },
      (error) => {
        // Errors should be returned too instead of thrown
        return Promise.resolve(new VError(error, "storage service error"));
      },
    );
  }

  public async isReady(): Promise<boolean> {
    const result: AxiosResponse<unknown> = await this.axiosInstance.get("/readiness");
    return result.status === 200;
  }

  public async getVersion(): Promise<Version> {
    const result: AxiosResponse<unknown> = await this.axiosInstance.get("/version");
    if (result.status !== 200) {
      return {
        release: "",
        commit: "",
        buildTimeStamp: "",
        ping: "",
      } as Version;
    }

    return result?.data as Version;
  }

  public async getTimestamp(): Promise<number[]> {
    const result: AxiosResponse<unknown> = await this.axiosInstance.get("/timestamp");
    if (result.status !== 200) {
      return [];
    }
    return result.data as number[];
  }

  public async uploadObject(file: File): Promise<Result.Type<UploadResponse>> {
    logger.debug(`Uploading Object "${file.fileName}"`);

    let requestData: UploadRequest = {
      fileName: encodeURIComponent(file.fileName || ""),
      content: file.documentBase64,
      comment: encodeURIComponent(file.comment || ""),
    };
    if (config.encryptionPassword) {
      requestData.fileName = encrypt(config.encryptionPassword, requestData.fileName);
      requestData.content = encrypt(config.encryptionPassword, requestData.content);
      requestData.comment = requestData.comment
        ? encrypt(config.encryptionPassword, requestData.comment)
        : undefined;
    }
    const url = `/upload?docId=${file.id}`;
    const uploadResponse = await this.axiosInstance.post(url, requestData);
    if (Result.isErr(uploadResponse)) {
      logger.error(`Error while uploading document ${file.id} to storage service.`);
      return new VError(uploadResponse, "Uploading the object failed");
    } else if (uploadResponse.status !== 200) {
      logger.error(`Error while uploading document ${file.id} to storage service.`);
      return new VError("Uploading the object failed");
    }
    return uploadResponse.data;
  }

  public async downloadObject(id: string, secret: string): Promise<Result.Type<StorageObject>> {
    logger.debug(`Downloading Object with id: "${id}"`);

    const url = `/download?docId=${id}`;
    const axiosConfig = {
      headers: {
        secret: secret,
      },
    };
    const downloadResponse = await this.axiosInstance.get(url, axiosConfig);
    if (Result.isErr(downloadResponse)) {
      logger.error(`Error while downloading document ${id} from storage service.`);
      return new VError(downloadResponse, "downloading object failed");
    } else if (downloadResponse.status !== 200) {
      logger.error(`Error while downloading document ${id} from storage service.`);
      return new VError("Downloading object failed");
    }

    let documentObject: StorageObject = {
      id: downloadResponse.data.meta.docid,
      fileName: decodeURIComponent(downloadResponse.data.meta.filename),
      base64: downloadResponse.data.data,
      lastModified: downloadResponse.data.meta.lastModified,
    };

    if (config.encryptionPassword) {
      logger.debug("Decrypting file with encryptionPassword");
      const fileName = decrypt(config.encryptionPassword, documentObject.fileName);
      const base64 = decrypt(config.encryptionPassword, documentObject.base64);
      if (Result.isErr(fileName)) {
        return new VError(fileName, "failed to decrypt fileName from storage service");
      }
      if (Result.isErr(base64)) {
        return new VError(base64, "failed to decrypt file base64 from storage service");
      }
      documentObject.fileName = fileName;
      documentObject.base64 = base64;
    }

    return documentObject;
  }

  public async deleteObject(id: string, secret: string): Promise<Result.Type<DeleteResponse>> {
    logger.info(`Deleting document with id: "${id}"`);

    const url = `/delete?docId=${id}`;
    const axiosConfig = {
      headers: {
        secret: secret,
      },
    };
    const deleteResponse = await this.axiosInstance.delete(url, axiosConfig);

    if (Result.isErr(deleteResponse)) {
      logger.error(`Error while deleting document ${id} from storage service.`);
      return new VError(deleteResponse, "Deleting object failed");
    } else if (deleteResponse.status !== 204) {
      logger.error(`Error while deleting document ${id} from storage service.`);
      return new VError("Deleting object failed");
    }
    return {
      status: 204,
    };
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}
