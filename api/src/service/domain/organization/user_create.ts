import Joi = require("joi");

import Intent, { userDefaultIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { Permissions } from "../permissions";
import { GlobalPermissions, identitiesAuthorizedFor } from "../workflow/global_permissions";
import { canAssumeIdentity } from "./auth_token";
import { KeyPair } from "./key_pair";
import { ServiceUser } from "./service_user";
import * as UserCreated from "./user_created";
import { sourceUserRecords } from "./user_eventsourcing";
import * as UserRecord from "./user_record";

export interface RequestData {
  userId: string;
  displayName: string;
  organization: string;
  passwordPlaintext: string;
  additionalData?: object;
}

const requestDataSchema = Joi.object({
  userId: UserRecord.idSchema.required(),
  displayName: Joi.string().required(),
  organization: Joi.string().required(),
  passwordPlaintext: Joi.string().required(),
  additionalData: Joi.object(),
});

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getGlobalPermissions(): Promise<GlobalPermissions>;
  userExists(userId: string): Promise<boolean>;
  createKeyPair(): Promise<KeyPair>;
  hash(plaintext: string): Promise<string>;
  encrypt(plaintext: string): Promise<string>;
}

export async function createUser(
  ctx: Ctx,
  creatingUser: ServiceUser,
  data: RequestData,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  const source = ctx.source;
  const publisher = creatingUser.id;
  const eventTemplate = {
    id: data.userId,
    displayName: data.displayName,
    organization: data.organization,
    passwordHash: "...",
    address: "...",
    encryptedPrivKey: "...",
    permissions: newDefaultPermissionsFor(creatingUser.id),
    additionalData: data.additionalData || {},
  };

  if (await repository.userExists(data.userId)) {
    const unfinishedBusinessEvent = UserCreated.createEvent(source, publisher, eventTemplate);
    return {
      newEvents: [],
      errors: [new PreconditionError(ctx, unfinishedBusinessEvent, "user already exists")],
    };
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const permissions = await repository.getGlobalPermissions();
    const isAuthorized = identitiesAuthorizedFor(permissions, "global.createUser").some(identity =>
      canAssumeIdentity(creatingUser, identity),
    );
    if (!isAuthorized) {
      const unfinishedBusinessEvent = UserCreated.createEvent(source, publisher, eventTemplate);
      return {
        newEvents: [],
        errors: [new NotAuthorized(ctx, creatingUser.id, unfinishedBusinessEvent)],
      };
    }
  }

  eventTemplate.passwordHash = await repository.hash(data.passwordPlaintext);

  // Every user gets her own address:
  const keyPair = await repository.createKeyPair();
  eventTemplate.address = keyPair.address;
  eventTemplate.encryptedPrivKey = await repository.encrypt(keyPair.privkey);

  const createEvent = UserCreated.createEvent(source, publisher, eventTemplate);

  // Check that the event is valid by trying to "apply" it:
  const { errors } = sourceUserRecords(ctx, [createEvent]);
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, createEvent, errors)] };
  }

  return { newEvents: [createEvent], errors: [] };
}

function newDefaultPermissionsFor(userId: UserRecord.Id): Permissions {
  // The user can always do anything anyway:
  if (userId === "root") return {};

  // All group related permissions granted by default:
  const intents: Intent[] = userDefaultIntents;
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [userId] }), {});
}
