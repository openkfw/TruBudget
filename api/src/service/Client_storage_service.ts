import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { performance } from "perf_hooks";
import { VError } from "verror";
import * as Result from "../result";
import {
  StorageObject,
  StorageServiceClientI,
  UploadResponse,
  Version,
} from "./Client_storage_service.h";

interface UploadRequest {
  fileName: string;
  content: string;
}

export default class StorageServiceClient implements StorageServiceClientI {
  private axiosInstance: AxiosInstance;

  private timeStamp: number = 0;

  constructor(settings: AxiosRequestConfig) {
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
    return await this.axiosInstance.get("/readiness");
  }

  public async getVersion(): Promise<Version> {
    const result = await this.axiosInstance.get("/version");
    if (result.status !== 200) {
      return {
        release: "",
        commit: "",
        buildTimeStamp: "",
        ping: "",
      } as Version;
    }

    return result?.data;
  }

  public async uploadObject(
    id: string,
    name: string,
    data: string,
  ): Promise<Result.Type<UploadResponse>> {
    const requestData: UploadRequest = {
      fileName: name,
      content: data,
    };
    const url = `/upload?docId=${id}`;
    const UploadResponseResult = await this.axiosInstance.post(url, requestData);
    if (Result.isErr(UploadResponseResult)) {
      return new VError(UploadResponseResult, "upload object failed");
    }
    return UploadResponseResult.data;
  }

  public async downloadObject(id: string, secret: string): Promise<Result.Type<StorageObject>> {
    const url = `/download?docId=${id}`;
    const config = {
      headers: {
        secret: secret,
      },
    };
    const DownloadResponseResult = await this.axiosInstance.get(url, config);
    if (Result.isErr(DownloadResponseResult)) {
      return new VError(DownloadResponseResult, "downloading object failed");
    }

    const documentObject: StorageObject = {
      id: DownloadResponseResult.data.meta.docid,
      fileName: DownloadResponseResult.data.meta.filename,
      base64: DownloadResponseResult.data.data,
    };
    return documentObject;
  }

  public getAxiosInstance() {
    return this.axiosInstance;
  }
}
