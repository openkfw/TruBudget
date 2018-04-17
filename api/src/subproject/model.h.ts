import { AllowedUserGroupsByIntent } from "../authz/types";
import { LogEntry, Stream } from "../multichain/Client.h";
import Intent from "../authz/intents";

export interface SubProjectStreamMetadata {
  displayName: string;
  creationUnixTs: string;
  description?: string;
  status: "open" | "done";
  amount: string;
  currency: string;
  permissions?: string;
  logs?: LogEntry[];
}
