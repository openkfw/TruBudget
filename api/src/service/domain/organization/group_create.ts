import Joi = require("joi");

import Intent, { groupIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
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
  description: Joi.string()
    .allow("")
    .required(),
  members: Group.membersSchema.required(),
  additionalData: AdditionalData.schema,
});

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getGlobalPermissions(): Promise<GlobalPermissions>;
  groupExists(groupId: string): Promise<boolean>;
}

export async function createGroup(
  ctx: Ctx,
  creatingUser: ServiceUser,
  data: RequestData,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
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

  if (await repository.groupExists(createEvent.group.id)) {
    return {
      newEvents: [],
      errors: [new PreconditionError(ctx, createEvent, "group already exists")],
    };
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const intent = "global.createGroup";
    const permissions = await repository.getGlobalPermissions();
    const isAuthorized = identitiesAuthorizedFor(permissions, intent).some(identity =>
      canAssumeIdentity(creatingUser, identity),
    );
    if (!isAuthorized) {
      return {
        newEvents: [],
        errors: [new NotAuthorized({ ctx, userId: creatingUser.id, intent })],
      };
    }
  }

  // Check that the event is valid by trying to "apply" it:
  const { errors } = sourceGroups(ctx, [createEvent]);
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, createEvent, errors)] };
  }

  return { newEvents: [createEvent], errors: [] };
}

function newDefaultPermissionsFor(user: ServiceUser): Permissions {
  // The user can always do anything anyway:
  if (user.id === "root") return {};

  // All group related permissions granted by default:
  const intents: Intent[] = groupIntents;
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [user.id] }), {});
}
