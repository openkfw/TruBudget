import { performance } from "perf_hooks";

import axios, { AxiosResponse } from "axios";

const instance = axios.create();

class BlockchainApi {
  timeStamp = 0;

  constructor() {
    instance.interceptors.request.use((request) => {
      if (request.url?.includes("/version")) {
        this.timeStamp = performance.now();
      }
      return request;
    });

    instance.interceptors.response.use((response) => {
      if (response.config.url?.includes("/version")) {
        response.data.ping = performance.now() - this.timeStamp;
      }
      return response;
    });
  }

  setBaseUrl = (url): void => {
    instance.defaults.baseURL = `${url}`;
  };

  fetchVersion = (): Promise<AxiosResponse> => instance.get("/version");
}

export default BlockchainApi;
