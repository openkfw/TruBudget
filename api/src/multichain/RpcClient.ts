import * as http from "http";
import * as https from "https";
import { ConnectionSettings } from "./RpcClient.h";
import RpcResponse from "./RpcResponse.h";
import RpcError from "./RpcError";
import RpcRequest from "./RpcRequest.h";

export class RpcClient {
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
