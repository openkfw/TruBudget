import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { performance } from "perf_hooks";
import { config } from "../config";
import logger from "../lib/logger";
import { decrypt, encrypt } from "../lib/symmetricCrypto";
import * as Result from "../result";
import { MultichainClient } from "./Client.h";
import * as Liststreamkeyitems from "./liststreamkeyitems";
import { ConnectionSettings } from "./RpcClient.h";
import RpcError from "./RpcError";
import RpcRequest from "./RpcRequest.h";

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
      maxBodyLength: 67000000, // ~50mb in base64
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
    if (config.encryptionPassword && method === "publish") {
      params = this.encryptItems(params);
    }

    logger.trace({ parameters: { method, params } }, `Invoking method ${method}`);
    const request: RpcRequest = {
      method,
      params,
    };

    return new Promise<any>(async (resolve, reject) => {
      this.instance
        .post("/", JSON.stringify(request))
        .then(async (resp) => {
          logger.trace({ data: resp.data }, "Received valid response.");

          if (logger.levelVal >= logger.levels.values.debug) {
            const countKey = `${method}(${params.map((x) => JSON.stringify(x)).join(", ")})`;
            const hrtimeDiff = process.hrtime(startTime);
            const elapsedMilliseconds = (hrtimeDiff[0] * 1e9 + hrtimeDiff[1]) / 1e6;
            durations.set(countKey, (durations.get(countKey) || 0) + elapsedMilliseconds);
            count.set(countKey, (count.get(countKey) || 0) + 1);
          }
          let responseData = resp.data.result;
          if (
            method === "liststreamitems" ||
            method === "liststreamkeyitems" ||
            method === "liststreamblockitems"
          ) {
            const items = await this.convertToReadableItems(responseData);
            const error = items.find((item) => Result.isErr(item));
            if (Result.isErr(error)) {
              logger.error({}, "Error ", error.message);
              logger.debug({ error }, "Error ", error.message);
              reject(error);
            }
            responseData = items;
            resolve(responseData);
          } else {
            resolve(responseData);
          }
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
            logger.error({ error: error.message }, "No response from multichain received.");
            response = new RpcError(500, "No Response from Multichain", {}, error.message);
          } else {
            // Something happened in setting up the request that triggered an Error
            logger.error({ error: error.message }, "Error ", error.message);
            response = new RpcError(500, `other error: ${error.message}`, {}, "");
          }
          reject(response);
        });
    });
  }

  private encryptItems = (items) => {
    let encrypteditems: any[];
    encrypteditems = items.map((item, index) => {
      let encryptedObjectAsPlainString = "";
      if (index === 0 || index === 1 || item === "offchain") {
        // streamname, keys, offchain-flag are not encrypted
        return item;
      }
      if (config.encryptionPassword) {
        encryptedObjectAsPlainString = encrypt(config.encryptionPassword, JSON.stringify(item));
      }
      // Wrapping encrypted plaintext into object for multichain
      return { json: encryptedObjectAsPlainString };
    });
    items = encrypteditems;
    return items;
  };

  private decryptItem = (item) => {
    let dataResult = item.data;
    if (item.data.json) {
      const plainStringToDecrypt = item.data.json;
      if (config.encryptionPassword) {
        if (typeof plainStringToDecrypt !== "string") {
          return new RpcError(
            500,
            "Failed to decrypt events: expected string, but got other type instead. This error usually occurs when you set the ENCRYPTION_PASSWORD at an unencrypted blockchain. To resolve this error, unset the env var ENCRYPTION_PASSWORD.",
            {},
            "",
          );
        }
        const jsonString = decrypt(config.encryptionPassword, plainStringToDecrypt);
        if (Result.isErr(jsonString)) {
          return new RpcError(
            500,
            "Failed to decrypt events from blockchain. Is the ENCRYPTION_PASSWORD correct?",
            {},
            "",
          );
        }
        dataResult = JSON.parse(jsonString);
      } else {
        if (typeof plainStringToDecrypt === "string") {
          return new RpcError(
            500,
            "Failed to retrieve events: expected an event, but got a string instead. This error usually occurs when you don't set the ENCRYPTION_PASSWORD at an encrypted blockchain. To resolve this error, set the env var ENCRYPTION_PASSWORD.",
            {},
            "",
          );
        }
      }
    }
    return { ...item, data: dataResult };
  };

  public async retrieveItems(streamName: string, start: number, count: number): Promise<any[]> {
    const verbose: boolean = false;
    const items: any[] = await this.invoke("liststreamitems", streamName, verbose, count, start);
    return await this.convertToReadableItems(items);
  }

  private async convertToReadableItems(items): Promise<any[]> {
    // if data size is bigger than the runtime variable "maxshowndata"
    // the data has to be accessed by calling gettxoutdata
    // Increase maxshowndata with command 'setruntimeparam maxshowndata <value>' in the multichain-cli
    return Promise.all(
      items.map(async (item: Liststreamkeyitems.Item) => {
        if (item.data && item.data.hasOwnProperty("vout") && item.data.hasOwnProperty("txid")) {
          logger.warn(
            "Reached max data size. Maybe you should increase the runtime variable 'maxshowndata' of the multichain" +
              "with command: 'setruntimeparam maxshowndata <value>'.",
          );
          item.data = await this.invoke("gettxoutdata", item.data.txid, item.data.vout);
          logger.debug({ item: item.data }, "Received items.");
        }
        return this.decryptItem(item);
      }),
    );
  }
}
