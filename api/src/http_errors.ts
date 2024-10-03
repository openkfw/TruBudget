import { VError } from "verror";

import logger from "./lib/logger";

/**
 * Represents the body of an error
 */
interface ErrorBody {
  apiVersion: "1.0" | "2.0";
  error: {
    code: number;
    message: string;
  };
}

/**
 * Converts an error object to an appropriate http error
 *
 * @param error
 * @returns an error object containing appropriate status code and an {@link ErrorBody}
 */
export function toHttpError(
  error: unknown | unknown[],
  version = "1.0",
): { code: number; body: ErrorBody } {
  const errors = error instanceof Array ? error : [error];
  const httpErrors = errors.map(convertError);
  const httpError = httpErrors.reduce((acc, err) => ({
    code: Math.max(acc.code, err.code),
    message: acc.message === "" ? err.message : `${acc.message}, ${err.message}`,
  }));
  // don't reveal details in case of authentication issue
  // replace error message sent to client with generic "Authentication Failed"
  if (httpError.code === 401) {
    return {
      code: httpError.code,
      body: toErrorBody({ code: httpError.code, message: "Authentication Failed" }, version),
    };
  }
  return { code: httpError.code, body: toErrorBody(httpError, version) };
}

/**
 * Converts an error to an object containing status code and message
 *
 * @param error the error to convert
 * @returns an object containing status code and message
 */
function convertError(error): { code: number; message: string } {
  if (error instanceof Error) {
    logger.debug({ error }, error.message);
    return handleError(error);
  } else {
    logger.fatal({ error }, "BUG: Caught a non-Error type");
    logger.trace();
    return { code: 500, message: "Sorry, something went wrong :(" };
  }
}

/**
 * Unpacks the error in an object containing just the error code and the message
 *
 * @param error the {@link Error} to handle
 * @returns object containing the error code and error message
 */
function handleError(error: Error): { code: number; message: string } {
  // We select the outer-most error that makes sense to turn into a status code:
  const name = selectHighLevelCause(error);

  switch (name) {
    case "BadRequest":
    case "ValidationError":
      return { code: 400, message: error.message };

    case "AuthenticationFailed":
      return { code: 401, message: error.message };

    case "NotAuthorized":
      return { code: 403, message: error.message };

    case "NotFound":
      return { code: 404, message: error.message };

    case "AlreadyExists":
      return { code: 409, message: error.message };

    case "PreconditionError":
      return { code: 412, message: error.message };

    default:
      return { code: 500, message: error.message };
  }
}

/**
 * Recursively returns the highest level cause of the given error
 *
 * @param error the error to handle
 * @returns a string containing the name of the cause of the error
 */
function selectHighLevelCause(error: Error): string {
  if (error.name !== "Error" && error.name !== "VError") {
    return error.name;
  }
  const cause = VError.cause(error);
  if (cause === null) {
    return error.name;
  } else {
    return selectHighLevelCause(cause);
  }
}

/**
 * Converts a given code and error message to an {@link ErrorBody}
 *
 * @param param0 object containing the code and error message of an error
 * @returns an {@link ErrorBody} that contains the API version and the actual error
 */
function toErrorBody({ code, message }, version = "1.0"): ErrorBody {
  return {
    apiVersion: version as "1.0" | "2.0",
    error: {
      code,
      message,
    },
  };
}
