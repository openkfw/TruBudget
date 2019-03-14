import logger from "./lib/logger";
import { NotAuthorized } from "./service/domain/errors/not_authorized";
import { NotFound } from "./service/domain/errors/not_found";
import { PreconditionError } from "./service/domain/errors/precondition_error";

interface ErrorBody {
  apiVersion: "1.0";
  error: {
    code: number;
    message: string;
  };
}

export function toHttpError(error: any | any[]): { code: number; body: ErrorBody } {
  const errors = error instanceof Array ? error : [error];
  const httpErrors = errors.map(convertError);
  const httpError = httpErrors.reduce((acc, err) => ({
    code: Math.max(acc.code, err.code),
    message: acc.message === "" ? err.message : `${acc.message}, ${err.message}`,
  }));
  return { code: httpError.code, body: toErrorBody(httpError) };
}

// Converts internal to HTTP errors. Please sort by error code, ascending :)
function convertError(error: any): { code: number; message: string } {
  if (error instanceof PreconditionError) {
    logger.debug({ error }, error.message);
    return { code: 400, message: error.message };
  } else if (error instanceof NotAuthorized) {
    logger.debug({ error }, error.message);
    return { code: 403, message: error.message };
  } else if (error instanceof NotFound) {
    logger.debug({ error }, error.message);
    return { code: 404, message: error.message };
  } else if (error instanceof Error) {
    logger.warn({ error }, error.message);
    return { code: 500, message: error.message };
  } else {
    logger.fatal({ error }, "BUG: Caught a non-Error type");
    console.trace();
    return { code: 500, message: "Sorry, something went wrong :(" };
  }
}

function toErrorBody({ code, message }): ErrorBody {
  return {
    apiVersion: "1.0",
    error: {
      code,
      message,
    },
  };
}
