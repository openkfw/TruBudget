/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { performance } from "perf_hooks";
import { VError } from "verror";
import { config } from "../config";
import logger from "../lib/logger";
import { decrypt, encrypt } from "../lib/symmetricCrypto";
import * as Result from "../result";
import { Item } from "./liststreamitems";
import {
  ConnectionSettings,
  EncryptedItemToPublish,
  ItemToPublish,
  StreamItem,
} from "./RpcClient.h";
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
  private instance: AxiosInstance;

  private timeStamp;

  constructor(settings: ConnectionSettings) {
    logger.debug("Setting up RpcClient");
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

  private generateRequest = (
    stream: String,
    keys: String | String[],
    streamitem: ItemToPublish,
    address?: String,
    offchain?: Boolean,
  ): Result.Type<any> => {
    let params = [stream, keys, streamitem];
    let method: string;
    if (config.signingMethod === "user" && address) {
      method = "publishfrom";
      params = offchain ? [address, ...params, "offchain"] : [address, ...params];
    } else if (config.signingMethod === "node" || (config.signingMethod === "user" && !address)) {
      method = "publish";
      params = offchain ? [...params, "offchain"] : params;
    } else {
      logger.error(`Failed to publish event. Invalid signing method: ${config.signingMethod}`);
      return new RpcError(
        500,
        `Failed to publish data to the chain. Invalid signing method: ${config.signingMethod}`,
        {},
        "",
      );
    }
    return { method, params };
  };

  /**
   * Used to publish a stream item on the chain
   *
   * @param stream name of the stream where the item should be published
   * @param keys keys of the stremitem
   * @param item the item itself
   * @param address the address to publish the event from. is optional and is only used if the env var SIGNING_METHOD is used
   * @param offchain a boolean indicating whether the item should be saved offchain or not
   */
  public invokePublish(
    stream: String,
    keys: String[] | String,
    item: ItemToPublish | any,
    address?: String,
    offchain?: Boolean,
  ): any {
    const startTime = process.hrtime();

    // Decide if the item should be encrypted first
    const streamitem = config.encryptionPassword ? this.encryptItem(item) : item;

    const requestResult = this.generateRequest(stream, keys, streamitem, address, offchain);
    if (Result.isErr(requestResult)) {
      return Promise.reject(requestResult);
    }
    const request: RpcRequest = {
      method: requestResult.method,
      params: requestResult.params,
    };

    logger.trace({ parameters: request }, `Invoking method ${request.method}`);
    return new Promise<any>(async (resolve, reject) => {
      this.instance
        .post("/", JSON.stringify(request))
        .then(async (resp) => {
          logger.trace({ data: resp.data }, "Received valid response.");

          if (logger.levelVal >= logger.levels.values.debug) {
            const countKey = `${request.method}(${request.params
              .map((x) => JSON.stringify(x))
              .join(", ")})`;
            const hrtimeDiff = process.hrtime(startTime);
            const elapsedMilliseconds = (hrtimeDiff[0] * 1e9 + hrtimeDiff[1]) / 1e6;
            durations.set(countKey, (durations.get(countKey) || 0) + elapsedMilliseconds);
            count.set(countKey, (count.get(countKey) || 0) + 1);
          }
          let responseData = resp.data.result;
          resolve(responseData);
        })
        .catch((error: AxiosError | Error) => {
          let response: RpcError = this.handleError(error, request.method, request.params);
          reject(response);
        });
    });
  }

  /**
   * Used to invoke MultiChain RPC-Commands. For publishing an event to the chain the invokePublish function should be used
   *
   * @param method the RPC-command to be invoked
   * @param params the parameters, depend on the specific method, can be stream name, keys, or others
   * @returns return value also depends on the speicific method, can be listitems, permissions, or others
   */
  public invoke(method: string, ...params: any[]): any {
    const startTime = process.hrtime();

    const request: RpcRequest = {
      method,
      params,
    };
    logger.trace({ parameters: request }, `Invoking method ${method} on multichain`);

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
            const itemResults = await this.convertToReadableItems(responseData);
            // Log errors occured while converting and skip items
            const items = itemResults.reduce((items, item) => {
              if (Result.isOk(item)) {
                items.push(item);
              } else {
                this.handleError(item, method, params);
              }
              return items;
            }, [] as StreamItem[]);
            responseData = items;
            resolve(responseData);
          } else {
            resolve(responseData);
          }
        })
        .catch((error: AxiosError | Error) => {
          logger.trace(
            `Caught error during invoke of ${method} with params ${params}. Handling error ${JSON.stringify(
              error,
            )}`,
          );
          let response: RpcError = this.handleError(error, method, params);
          reject(response);
        });
    });
  }

  private handleError = (error: any, method: any, params: any) => {
    const isAxiosError: boolean = error.isAxiosError || false;
    if (isAxiosError) {
      if (error.response && error.response.data.error !== null) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx and WITH multichain errors:
        const response = error.response.data.error;
        const err = JSON.stringify(response);
        logger.error(
          `Error during invoke of ${String(method)} with params ${JSON.stringify(
            params,
          )}. Multichain errors occurred. ${err}`,
        );
        return response;
      }

      if (error.response) {
        // non 2xx answer but no multichain data
        logger.error(
          { error: error.response },
          `Error during invoke of ${method} with params ${JSON.stringify(
            params,
          )}. No multichain data.`,
        );
        return new RpcError(
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
        return new RpcError(500, "No Response from Multichain", {}, error.message);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error(
        `Error during invoke of ${method} with params ${JSON.stringify(params)}. ${error.message}`,
      );
      return new RpcError(500, `other error: ${error}`, error, "");
    }
  };

  private encryptItem = (item: ItemToPublish): EncryptedItemToPublish => {
    let encryptedObjectAsPlainString = "";
    if (config.encryptionPassword) {
      encryptedObjectAsPlainString = encrypt(config.encryptionPassword, JSON.stringify(item));
    }
    // Wrapping encrypted plaintext into object for multichain
    return { json: encryptedObjectAsPlainString };
  };

  private getOrDecryptItemData = (item: StreamItem): Result.Type<StreamItem> => {
    let dataResult = item.data;
    if (dataResult.json) {
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
            `Failed to retrieve events: expected an event, but got a string instead: "${plainStringToDecrypt}". Is your blockchain network encrypted using ENCRYPTION_PASSWORD?`,
            {},
            "",
          );
        }
      }
    }
    return { ...item, data: dataResult };
  };

  public async retrieveItems(streamName: string, start: number, count: number): Promise<Item[]> {
    const verbose: boolean = false;
    return this.invoke("liststreamitems", streamName, verbose, count, start);
  }

  private async convertToReadableItems(items: StreamItem[]): Promise<Result.Type<StreamItem>[]> {
    // if data size is bigger than the runtime variable "maxshowndata"
    // the data has to be accessed by calling gettxoutdata
    // Increase maxshowndata with command 'setruntimeparam maxshowndata <value>' in the multichain-cli
    return Promise.all(
      items.map(async (item: StreamItem) => {
        let readableData = item.data;
        if (item.data && item.data.hasOwnProperty("vout") && item.data.hasOwnProperty("txid")) {
          logger.debug(
            "Reached max data size of streamitem so it has to be fetched with the extra command 'gettxoutdata'. To increase this size use the runtime variable 'maxshowndata' of the multichain" +
              "with command: 'setruntimeparam maxshowndata <value>'.",
          );
          readableData = await this.invoke("gettxoutdata", item.data.txid, item.data.vout).catch(
            (error) => {
              // invoke does not support Results yet so we have to catch errors and return them
              return new VError(
                error,
                `Error during invoking gettxoutdata for txid ${item.data.txid}`,
              );
            },
          );
        }
        return this.getOrDecryptItemData({ ...item, data: readableData });
      }),
    );
  }
}
