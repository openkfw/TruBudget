import Intent from "../authz/intents";

export type Permissions = { [key in Intent]?: string[] };
