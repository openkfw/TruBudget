import logger from "./logger";

export function chunkArray<T>(items: T[], size: number | string): T[][] {
  let chunkSize: number;

  if (typeof size === "string") {
    chunkSize = parseInt(size);
    if (isNaN(chunkSize)) {
      logger.info(`Invalid chunk size "${size}", defaulting to 10`);
      chunkSize = 10;
    }
  } else if (typeof size === "number") {
    if (size <= 0 || isNaN(size)) {
      logger.info(`Invalid chunk size ${size}, defaulting to 10`);
      chunkSize = 10;
    } else {
      chunkSize = size;
    }
  } else {
    logger.info(`Invalid chunk size ${size}, defaulting to 10`);
    chunkSize = 10;
  }

  const chunks: Array<T[]> = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}
