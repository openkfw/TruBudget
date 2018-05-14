import Intent from "../authz/intents";

export interface Event {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: any;
}

export function throwUnsupportedEventVersion(event: Event): never {
  throw { kind: "UnsupportedEventVersion", event };
}
