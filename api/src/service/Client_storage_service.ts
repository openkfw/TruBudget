import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { performance } from "perf_hooks";
import { VError } from "verror";
import * as Result from "../result";
import {
  StorageObject,
  StorageServiceClientI,
  UploadResponse,
  Version,
} from "./Client_storage_service.h";
import { config } from "../config";
import { encrypt, decrypt } from "../lib/symmetricCrypto";
import logger from "lib/logger";

interface UploadRequest {
  fileName: string;
  content: string;
}

export default class StorageServiceClient implements StorageServiceClientI {
  private axiosInstance: AxiosInstance;

  private timeStamp: number = 0;

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

  public async uploadObject(
    id: string,
    name: string,
    data: string,
  ): Promise<Result.Type<UploadResponse>> {
    logger.debug(`Uploading Object "${name}"`);

    let requestData: UploadRequest = {
      fileName: encodeURIComponent(name),
      content: data,
    };
    if (config.encryptionPassword) {
      requestData.fileName = encrypt(config.encryptionPassword, requestData.fileName);
      requestData.content = encrypt(config.encryptionPassword, requestData.content);
    }
    const url = `/upload?docId=${id}`;
    const UploadResponseResult = await this.axiosInstance.post(url, requestData);
    if (Result.isErr(UploadResponseResult)) {
      return new VError(UploadResponseResult, "upload object failed");
    }
    return UploadResponseResult.data;
  }

  public async downloadObject(id: string, secret: string): Promise<Result.Type<StorageObject>> {
    logger.debug(`Downloading Object with id: "${id}"`);

    const url = `/download?docId=${id}`;
    const axiosConfig = {
      headers: {
        secret: secret,
      },
    };
    const DownloadResponseResult = await this.axiosInstance.get(url, axiosConfig);
    if (Result.isErr(DownloadResponseResult)) {
      return new VError(DownloadResponseResult, "downloading object failed");
    }

    let documentObject: StorageObject = {
      id: DownloadResponseResult.data.meta.docid,
      fileName: decodeURIComponent(DownloadResponseResult.data.meta.filename),
      base64: DownloadResponseResult.data.data,
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

  public getAxiosInstance() {
    return this.axiosInstance;
  }
}
