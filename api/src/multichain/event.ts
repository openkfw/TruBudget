import Intent from "../authz/intents";
import logger from "../lib/logger";

export interface Event {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: any;
}

export function throwUnsupportedEventVersion(event: Event): never {
  logger.error({ error: event }, "Unsupported event version.");
  throw { kind: "UnsupportedEventVersion", event };
}
