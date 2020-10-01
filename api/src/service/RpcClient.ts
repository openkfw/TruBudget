import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as http from "http";
import * as https from "https";
import { performance } from "perf_hooks";

import logger from "../lib/logger";
import { ConnectionSettings } from "./RpcClient.h";
import RpcError from "./RpcError";
import RpcRequest from "./RpcRequest.h";
import RpcResponse from "./RpcResponse.h";

const count = new Map();
const durations = new Map();
const nTopCalls = 3;
const topCallWindowSizeInSeconds = 30;
if (logger.levelVal >= logger.levels.values.debug) {
  const intervalTimer = setInterval(() => {
    if (!count.size) return;
    const topCalls = [...count.entries()]
      // Sort by total duration:
      .sort(
        ([whatA, _timesA], [whatB, _timesB]) =>
          (durations.get(whatB) || 0) - (durations.get(whatA) || 0),
      )
      // Take only the first nTopCalls:
      .slice(0, nTopCalls)
      // Compute average durations:
      .map(([what, times]) => {
        const total = Math.floor(durations.get(what) || 0);
        const avg = Math.floor(total / times);
        return [what, times, total, avg];
      });
    // .map(
    //   ([what, times, total, avg]) =>
    //     `${times}x avg=${Math.floor(avg)}ms total=${Math.floor(total)}ms: ${what}`,
    // );
    logger.debug(
      {
        calls: topCalls.map(([command, times, totalMs, avgMs]) => ({
          command,
          times,
          totalMs,
          avgMs,
        })),
      },
      `Top-${nTopCalls} calls in the last ${topCallWindowSizeInSeconds} seconds`,
    );
    // logger.debug(
    //   `Top-${nTopCalls} calls in the last ${topCallWindowSizeInSeconds} seconds:\n${topCalls.join(
    //     "\n",
    //   )}`,
    // );
    count.clear();
  }, topCallWindowSizeInSeconds * 1000);
  // The timer should not prevent the event loop from shutting down:
  intervalTimer.unref();
}

export class RpcClient {
  private call: (method: string, params: any) => any;
  private instance: AxiosInstance;
  private timeStamp;

  constructor(settings: ConnectionSettings) {
    const protocol = `${settings.protocol || "http"}`;
    const host = settings.host || "localhost";
    const port = settings.port || 8570;
    this.instance = axios.create({
      baseURL: `${protocol}://${host}:${port}/`,
      method: "POST",
      timeout: 90000,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      maxContentLength: 104857600,
      auth: {
        username: settings.username || "multichainrpc",
        password: settings.password,
      },
    });
    this.instance.interceptors.request.use((request: AxiosRequestConfig) => {
      if (JSON.parse(request.data).method?.includes("getinfo")) {
        this.timeStamp = performance.now();
      }
      return request;
    });

    this.instance.interceptors.response.use((response: AxiosResponse<any>) => {
      if (JSON.parse(response.config.data).method === "getinfo") {
        response.data.result.ping = performance.now() - this.timeStamp;
      }
      return response;
    });
  }

  public invoke(method: string, ...params: any[]): any {
    const startTime = process.hrtime();

    logger.trace({ parameters: { method, params } }, `Invoking method ${method}`);
    const request: RpcRequest = {
      method,
      params,
    };
    return new Promise<RpcResponse>(async (resolve, reject) => {
      this.instance
        .post("/", JSON.stringify(request))
        .then((resp) => {
          // this is only on Response code 2xx
          logger.trace({ data: resp.data }, "Received valid response.");

          if (logger.levelVal >= logger.levels.values.debug) {
            const countKey = `${method}(${params.map((x) => JSON.stringify(x)).join(", ")})`;
            const hrtimeDiff = process.hrtime(startTime);
            const elapsedMilliseconds = (hrtimeDiff[0] * 1e9 + hrtimeDiff[1]) / 1e6;
            durations.set(countKey, (durations.get(countKey) || 0) + elapsedMilliseconds);
            count.set(countKey, (count.get(countKey) || 0) + 1);
          }
          resolve(resp.data.result);
        })
        .catch((error: AxiosError) => {
          let response: RpcError;

          if (error.response && error.response.data.error !== null) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx and WITH multichain errors:
            response = error.response.data.error;
            reject(response);
            logger.trace(
              { response },
              `Error during invoke of ${method}. Multichain errors occured.`,
            );
            return;
          }

          if (error.response) {
            // non 2xx answer but no multichain data
            logger.error(
              { error: error.response },
              `Error during invoke of ${method}. No multichain data.`,
            );
            response = new RpcError(
              Number(error.response.status),
              String(error.response.statusText),
              error.response.headers,
              error.response.data,
            );
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            // console.error(error.request);
            logger.error({ error: error.message }, "No response received.");
            response = new RpcError(500, "No Response", {}, error.message);
          } else {
            // Something happened in setting up the request that triggered an Error
            logger.error({ error: error.message }, "Error ", error.message);
            response = new RpcError(500, `other error: ${error.message}`, {}, "");
          }
          reject(response);
        });
    });
  }
}

// DEPRECATED, we're testing the new implementation
// TODO -- Remove this code block as it's not needed
export class VanillaNodeJSRpcClient {
  private call: (method: string, params: any) => any;
  constructor(settings: ConnectionSettings) {
    const requestOptions: http.RequestOptions = {
      protocol: `${settings.protocol || "http"}:`,
      host: settings.host || "localhost",
      port: settings.port || 8570,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      auth: `${settings.username || "multichainrpc"}:${settings.password}`,
    };
    const sendRequest = settings.protocol === "https" ? https.request : http.request;
    this.call = (method: string, params: any[]) => {
      const request: RpcRequest = {
        method,
        params,
      };

      return new Promise<RpcResponse>((resolve, reject) => {
        function handleMessage(message: http.IncomingMessage) {
          let body = "";

          message
            .setEncoding("utf8")
            .on("data", (chunk) => (body += chunk))
            .on("error", reject)
            .on("end", () => handleResponse(message, body));
        }

        function handleResponse(message: http.IncomingMessage, body: string) {
          let response: RpcResponse;

          try {
            response = JSON.parse(body);
          } catch (error) {
            reject(
              new RpcError(
                Number(message.statusCode),
                String(message.statusMessage),
                message.headers,
                body,
              ),
            );
            return;
          }

          if (response.error !== null) {
            reject(response.error);
            return;
          }

          resolve(response.result);
        }

        const requestBody = JSON.stringify(request);
        logger.info(requestBody);
        sendRequest(requestOptions, handleMessage).on("error", reject).end(requestBody);
      });
    };
  }
  public invoke(method: string, ...params: any[]): any {
    return this.call(method, params);
  }
}
