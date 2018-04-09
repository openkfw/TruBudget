import RpcResponse from "./RpcResponse.h";

/**
 * Error thrown by an [[RpcClientInstance]] when the invoked command returns an error.
 */
export default class MultichainError extends Error {
  /**
   * Creates an instance of [[MultiChainError]].
   * @param response The RPC response of the invoked command.
   */
  constructor(public readonly response: RpcResponse) {
    super();
    if (response.error === null) throw new Error("The RPC response does not contain an error.");
    this.message = `[${response.error.code}] ${response.error.message}`;
  }
}
