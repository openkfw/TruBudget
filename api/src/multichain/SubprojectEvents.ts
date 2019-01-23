import uuid = require("uuid");

import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import { isNotEmpty } from "../lib/emptyChecks";
import { inheritDefinedProperties } from "../lib/inheritDefinedProperties";
import logger from "../lib/logger";
import { asMapKey } from "./Client";
import { MultichainClient } from "./Client.h";
import { Event, throwUnsupportedEventVersion } from "./event";
import * as Liststreamkeyitems from "./responses/liststreamkeyitems";

export * from "./event";

export async function getSubprojectList(multichain: MultichainClient): Promise<Subproject[]> {
  // TODO
}
