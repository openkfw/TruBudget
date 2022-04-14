/* eslint-disable @typescript-eslint/no-explicit-any */
export { RpcClient } from "./RpcClient";

/**
 * Connection settings.
 */
export interface ConnectionSettings {
  /**
   * Protocol to use for the connection.
   * @default 'http'
   */
  readonly protocol?: "http" | "https";

  /**
   * IP address or hostname of the node to connect to.
   * @default 'localhost'
   */
  readonly host?: string;

  /**
   * Port number of the node to connect to.
   * @default 8570
   */
  readonly port?: number;

  /**
   * Username to use for authentication.
   * @default 'multichainrpc'
   */
  readonly username?: string;

  /**
   * Password to use for authentication.
   */
  readonly password: string;
}

export interface StreamItem {
  publishers: string[];
  keys: string[];
  data: any; //encrypted, decrypted, unreadable
  confirmations: number;
  blocktime: number;
  txid: string;
  v?: number;
  offchain?: boolean;
  available?: boolean;
}
export interface ItemToPublish {
  json: object;
}

export interface EncryptedItemToPublish {
  json: string;
}
