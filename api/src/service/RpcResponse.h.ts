/**
 * JSON-RPC response.
 */
export default interface RpcResponse {
  /**
   * Result of the invoked method, if successful.
   */
  readonly result: any;

  /**
   * Error object, if method invocation failed.
   */
  readonly error: Error | null;

  /**
   * Identifier of the request associated with the response, if any.
   */
  readonly id: number | string | null;
}

/**
 * Type of the `error` property of [[RpcResponse]].
 */
export interface Error {
  /**
   * Error code.
   *
   * See [[ErrorCode]] for a list of predefined error codes.
   */
  readonly code: number;

  /**
   * Error description.
   */
  readonly message: string;
}

/**
 * JSON-RPC 2.0 predefined error codes.
 */
export enum ErrorCode {
  /**
   * The request body is an invalid JSON-RPC request.
   */
  InvalidRequest = -32600,

  /**
   * The invoked method does not exist.
   */
  MethodNotFound = -32601,

  /**
   * The method arguments are invalid.
   */
  InvalidParams = -32602,

  /**
   * Internal JSON-RPC error.
   */
  InternalError = -32603,

  /**
   * The request body is an invalid JSON document.
   */
  ParseError = -32700,
}
