/**
 * Error thrown by an [[RpcClientInstance]], if parsing the body of the response failed.
 */
export default class RpcError extends Error {
  /**
   * Creates an instance of [[RpcError]].
   * @param status Status code of the HTTP response.
   * @param statusText Status text of the HTTP response.
   * @param headers Headers of the HTTP response.
   * @param body Body of the HTTP response.
   */
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly headers: object,
    public readonly body: string,
  ) {
    super(`${status} ${statusText}`);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RpcError);
    }
  }
}
