import Joi = require("joi");

import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import { userDefaultIntents, userIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { AlreadyExists } from "../errors/already_exists";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { GlobalPermissions, identitiesAuthorizedFor } from "../workflow/global_permissions";
import * as GlobalPermissionGranted from "../workflow/global_permission_granted";
import { canAssumeIdentity } from "./auth_token";
import { KeyPair } from "./key_pair";
import { ServiceUser } from "./service_user";
import * as UserCreated from "./user_created";
import * as UserRecord from "./user_record";

export interface RequestData {
  userId: string;
  displayName: string;
  organization: string;
  passwordPlaintext: string;
  additionalData?: object;
}

const requestDataSchema = Joi.object({
  userId: UserRecord.idSchema.invalid("root").required(),
  displayName: Joi.string().required(),
  organization: Joi.string().required(),
  passwordPlaintext: Joi.string().required(),
  additionalData: AdditionalData.schema,
});

export function validate(input): Result.Type<RequestData> {
  const { value, error } = requestDataSchema.validate(input);
  return !error ? value : error;
}

interface Repository {
  getGlobalPermissions(): Promise<Result.Type<GlobalPermissions>>;
  userExists(userId: string): Promise<Result.Type<boolean>>;
  organizationExists(organization: string): Promise<Result.Type<boolean>>;
  createKeyPair(): Promise<KeyPair>;
  hash(plaintext: string): Promise<string>;
  encrypt(plaintext: string): Promise<string>;
  groupExists(userId: string): Promise<Result.Type<boolean>>;
}

export async function createUser(
  ctx: Ctx,
  creatingUser: ServiceUser,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const source = ctx.source;
  const publisher = creatingUser.id;
  const eventTemplate = {
    id: data.userId,
    displayName: data.displayName,
    organization: data.organization,
    passwordHash: "...",
    address: "...",
    encryptedPrivKey: "...",
    permissions: userIntents.reduce((acc, intent) => {
      return { ...acc, [intent]: [data.userId] };
    }, {}),
    additionalData: data.additionalData || {},
  };
  logger.trace("Creating user ", data);

  const createEvent = UserCreated.createEvent(source, publisher, eventTemplate);
  if (Result.isErr(createEvent)) {
    return new VError(createEvent, "failed to create user created event");
  }
  if (Result.isErr(validate(data))) {
    return new PreconditionError(ctx, createEvent, "can not create user called 'root'");
  }

  // Check user already exists:
  const userExistsResult = await repository.userExists(createEvent.user.id);
  if (Result.isErr(userExistsResult)) {
    return new VError(userExistsResult, "user exists check failed");
  }
  const userExists = userExistsResult;

  // Check group already exists:
  const groupExistsResult = await repository.groupExists(createEvent.user.id);
  if (Result.isErr(groupExistsResult)) {
    return new VError(groupExistsResult, "group exists check failed");
  }
  const groupExists = groupExistsResult;
  if (userExists || groupExists) {
    return new AlreadyExists(ctx, createEvent, createEvent.user.id);
  }

  // Check organization exists:
  const orgaExistsResult = await repository.organizationExists(data.organization);
  if (Result.isErr(orgaExistsResult)) {
    return new VError(orgaExistsResult, "organization exists check failed");
  }
  const orgaExists = orgaExistsResult;
  if (!orgaExists) {
    return new PreconditionError(ctx, createEvent, "organization does not exist");
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const intent = "global.createUser";
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

  logger.trace("User creation is legit - setting-up user account!");

  eventTemplate.passwordHash = await repository.hash(data.passwordPlaintext);
  logger.trace("Creating key-pair for new user...");

  // Every user gets her own address:
  const keyPair = await repository.createKeyPair();
  eventTemplate.address = keyPair.address;
  eventTemplate.encryptedPrivKey = await repository.encrypt(keyPair.privkey);

  // Check that the event is valid by trying to "apply" it:
  const result = UserCreated.createFrom(ctx, createEvent);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, createEvent, [result]);
  }
  logger.trace("Granting default permissions to new user ...");

  // Create events that'll grant default permissions to the user:
  const defaultPermissionGrantedEvents: Result.Type<GlobalPermissionGranted.Event[]> = [];
  for (const intent of userDefaultIntents) {
    const createEventResult = GlobalPermissionGranted.createEvent(
      ctx.source,
      publisher,
      intent,
      createEvent.user.id,
    );
    if (Result.isErr(createEventResult)) {
      return new VError(createEventResult, "failed to create permission grant event");
    }
    defaultPermissionGrantedEvents.push(createEventResult);
  }

  return [createEvent, ...defaultPermissionGrantedEvents];
}
