export class AuthenticationFailed extends Error {
  constructor(reason?: string) {
    super(`authentication failed${reason === undefined ? "" : `: ${reason}`}`);

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationFailed);
    }
  }
}
