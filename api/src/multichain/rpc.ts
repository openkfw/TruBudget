const { RpcClient } = require("multichain-api/RpcClient");

export interface ClientOptions {
  protocol: "http" | "https";
  host: string;
  port: number;
  username: string;
  password: string;
}

export type Command = any;

export type Error = any;

export interface Result {
  result?: any;
  error?: Error;
  id?: any;
}

export const Client = RpcClient;
export interface ClientType {
  (Command): Promise<Result | Error>;
}
