/* eslint-disable @typescript-eslint/no-explicit-any */
import Intent from "../authz/intents";
import { TruBudgetError } from "../error";

export interface Event {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: any;
}

export function throwUnsupportedEventVersion(event: Event): never {
  throw new TruBudgetError({ kind: "UnsupportedEventVersion", event });
}
