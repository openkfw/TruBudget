import { Project } from "../project/model";
import { SimpleIntent } from "./intents";

export type UserId = string;
export type GroupId = string;
export type People = Array<UserId | GroupId>;

// what it actually is:
export type AllowedUserGroupsByIntentMap = Map<SimpleIntent, People>;
// how it's stored on the chain:
export type AllowedUserGroupsByIntent = Array<Array<SimpleIntent | People>>;
