import * as http from "http";
import * as https from "https";
import { ConnectionSettings } from "./RpcClient.h";
import RpcResponse from "./RpcResponse.h";
import RpcError from "./RpcError";
import RpcRequest from "./RpcRequest.h";
import axios, { AxiosInstance, AxiosError } from "axios"

export class RpcClient {
  call: (string, any) => any;
  instance: AxiosInstance

  constructor(settings: ConnectionSettings) {
    const protocol = `${settings.protocol || "http"}`
    const host = settings.host || "localhost"
    const port = settings.port || 8570

    this.instance = axios.create({
      baseURL: `${protocol}://${host}:${port}/`,
      method: "POST",
      timeout: 2000,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      auth: {
        username: settings.username || "multichainrpc",
        password: settings.password
      }
    });
  }

  invoke(method: string, ...params: any[]): any {
    const request: RpcRequest = {
      method,
      params
    };

    return new Promise<RpcResponse>((resolve, reject) => {
      this.instance.post("/", JSON.stringify(request)).then(resp => {
        // this is only on Response code 2xx
        resolve(resp.data.result);
      }).catch((error: AxiosError) => {
        let response: RpcError

        if (error.response && (error.response.data.error !== null)) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx and WITH multichain errors:
          response = error.response.data.error
          reject(response)
          return;
        } else if (error.response) {
          // non 2xx answer but no multichain data
          response = new RpcError(
            Number(error.response.status),
            String(error.response.statusText),
            error.response.headers,
            error.response.data
          )
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          // console.error(error.request);
          response = new RpcError(500, "No Response", {}, "")
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', error.message);
          response = new RpcError(500, "other error", {}, "")
        }
        reject(response)
      })
    })
  }
}

// DEPRECATED, we're testing the new implementation
export class VanillaNodeJSRpcClient {
  call: (string, any) => any;
  constructor(settings: ConnectionSettings) {
    const requestOptions: http.RequestOptions = {
      protocol: `${settings.protocol || "http"}:`,
      host: settings.host || "localhost",
      port: settings.port || 8570,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      auth: `${settings.username || "multichainrpc"}:${settings.password}`
    };
    const sendRequest = settings.protocol === "https" ? https.request : http.request;
    this.call = (method: string, params: any[]) => {
      const request: RpcRequest = {
        method,
        params
      };

      return new Promise<RpcResponse>((resolve, reject) => {
        function handleMessage(message: http.IncomingMessage) {
          let body = "";

          message
            .setEncoding("utf8")
            .on("data", chunk => (body += chunk))
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
                body
              )
            );
            return;
          }

          if (response.error !== null) {
            reject(response.error);
            return;
          }

          resolve(response.result);
        }

        const body = JSON.stringify(request);
        console.log(body);
        sendRequest(requestOptions, handleMessage)
          .on("error", reject)
          .end(body);
      });
    };
  }
  invoke(method: string, ...params: any[]): any {
    return this.call(method, params);
  }
}
