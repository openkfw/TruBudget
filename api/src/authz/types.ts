import Intent from "./intents";
import { AuthToken } from "./token";

export type UserId = string;
export type GroupId = string;
export type People = Array<UserId | GroupId>;

export type Permissions = { [key in Intent]?: People };

export interface NotAuthorizedError {
  kind: "NotAuthorized";
  token: AuthToken;
  intent: Intent;
}
