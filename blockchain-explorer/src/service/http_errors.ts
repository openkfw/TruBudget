import { VError } from "verror";
// import logger from "./lib/logger";

interface ErrorBody {
  error: {
    code: number;
    message: string;
  };
}

export function toHttpError(error: any | any[]): {
  code: number;
  body: ErrorBody;
} {
  console.log("toHttpError << " + JSON.stringify(error));
  const errors = error instanceof Array ? error : [error];
  const httpErrors = errors.map(convertError);
  const httpError = httpErrors.reduce((acc, err) => ({
    code: Math.max(acc.code, err.code),
    message:
      acc.message === "" ? err.message : `${acc.message}, ${err.message}`,
  }));
  return { code: httpError.code, body: toErrorBody(httpError) };
}

function convertError(error: any): { code: number; message: string } {
  if (error instanceof Error) {
    // logger.debug({ error }, error.message);
    return handleError(error);
  } else {
    // logger.fatal({ error }, "BUG: Caught a non-Error type");
    // logger.trace();
    return {
      code: 500,
      message: "Other error detected: " + JSON.stringify(error),
    };
  }
}

function handleError(error: Error): { code: number; message: string } {
  // We select the outer-most error that makes sense to turn into a status code:
  const name = selectHighLevelCause(error);

  switch (name) {
    case "BadRequest":
    case "AuthenticationFailed":
      return { code: 400, message: error.message };

    case "NotAuthorized":
      return { code: 403, message: error.message };

    case "NotFound":
      return { code: 404, message: error.message };

    case "AlreadyExists":
      return { code: 409, message: error.message };

    case "PreconditionError":
      return { code: 412, message: error.message };

    default:
      return { code: 500, message: JSON.stringify(error) };
  }
}

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

function toErrorBody({ code, message }): ErrorBody {
  return {
    error: {
      code,
      message,
    },
  };
}
