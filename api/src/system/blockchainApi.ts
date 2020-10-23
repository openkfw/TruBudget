import axios from "axios";
import _isEmpty from "lodash/isEmpty";
import { performance } from "perf_hooks";

const instance = axios.create();

class BlockchainApi {
  timeStamp: number = 0;

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

  setBaseUrl = (url) => {
    instance.defaults.baseURL = `${url}`;
  };

  fetchVersion = () => instance.get(`/version`);
}

export default BlockchainApi;
