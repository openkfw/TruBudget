/**
 * JSON-RPC request.
 */
export default interface RpcRequest {
  /**
   * Name of the method to invoke.
   */
  readonly method: string;

  /**
   * List of arguments to invoke the method with, if any.
   */
  readonly params?: any[];

  /**
   * Request identifier.
   */
  readonly id?: number | string | null;
}
