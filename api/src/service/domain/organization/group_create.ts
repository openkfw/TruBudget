import Joi = require("joi");

import { VError } from "verror";
import Intent, { groupIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { AlreadyExists } from "../errors/already_exists";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { Permissions } from "../permissions";
import { GlobalPermissions, identitiesAuthorizedFor } from "../workflow/global_permissions";
import { canAssumeIdentity } from "./auth_token";
import * as Group from "./group";
import * as GroupCreated from "./group_created";
import { sourceGroups } from "./group_eventsourcing";
import { Identity } from "./identity";
import { ServiceUser } from "./service_user";

export interface RequestData {
  id: string;
  displayName: string;
  description?: string;
  members: Identity[];
  additionalData?: object;
}

const requestDataSchema = Joi.object({
  id: Group.idSchema,
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  members: Group.membersSchema.required(),
  additionalData: AdditionalData.schema,
});

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getGlobalPermissions(): Promise<Result.Type<GlobalPermissions>>;
  groupExists(groupId: string): Promise<Result.Type<boolean>>;
}

export async function createGroup(
  ctx: Ctx,
  creatingUser: ServiceUser,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const source = ctx.source;
  const publisher = creatingUser.id;
  const createEvent = GroupCreated.createEvent(source, publisher, {
    id: data.id,
    displayName: data.displayName,
    description: data.description || "",
    members: data.members,
    permissions: newDefaultPermissionsFor(creatingUser),
    additionalData: data.additionalData || {},
  });
  if (Result.isErr(createEvent)) {
    return new VError(createEvent, "failed to create group created event");
  }

  const groupExistsResult = await repository.groupExists(createEvent.group.id);
  if (Result.isErr(groupExistsResult)) {
    return new VError(groupExistsResult, "groupExists check failed");
  }
  const groupExists = groupExistsResult;
  if (groupExists) {
    return new AlreadyExists(ctx, createEvent, createEvent.group.id);
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const intent = "global.createGroup";
    const globalPermissionsResult = await repository.getGlobalPermissions();
    if (Result.isErr(globalPermissionsResult)) {
      return new VError(globalPermissionsResult, "get global permissions failed");
    }
    const globalPermissions = globalPermissionsResult;
    const isAuthorized = identitiesAuthorizedFor(globalPermissions, intent).some((identity) =>
      canAssumeIdentity(creatingUser, identity),
    );
    if (!isAuthorized) {
      return new NotAuthorized({ ctx, userId: creatingUser.id, intent });
    }
  }

  // Check that the event is valid by trying to "apply" it:
  const { errors } = sourceGroups(ctx, [createEvent]);
  if (errors.length > 0) {
    return new InvalidCommand(ctx, createEvent, errors);
  }

  return [createEvent];
}

function newDefaultPermissionsFor(user: ServiceUser): Permissions {
  // The user can always do anything anyway:
  if (user.id === "root") return {};

  // All group related permissions granted by default:
  const intents: Intent[] = groupIntents;
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [user.id] }), {});
}
