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
