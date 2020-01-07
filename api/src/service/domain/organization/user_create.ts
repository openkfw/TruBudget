import Joi = require("joi");

import Intent, { userDefaultIntents, userIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import * as GlobalPermissionGranted from "../workflow/global_permission_granted";
import { GlobalPermissions, identitiesAuthorizedFor } from "../workflow/global_permissions";
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

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getGlobalPermissions(): Promise<GlobalPermissions>;
  userExists(userId: string): Promise<boolean>;
  organizationExists(organization: string): Promise<boolean>;
  createKeyPair(): Promise<KeyPair>;
  hash(plaintext: string): Promise<string>;
  encrypt(plaintext: string): Promise<string>;
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

  const createEvent = UserCreated.createEvent(source, publisher, eventTemplate);

  if (Result.isErr(validate(data))) {
    return new PreconditionError(ctx, createEvent, "can not create user called 'root'");
  }

  if (await repository.userExists(data.userId)) {
    return new PreconditionError(ctx, createEvent, "user already exists");
  }
  if (!(await repository.organizationExists(data.organization))) {
    return new PreconditionError(ctx, createEvent, "organization does not exist");
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const intent = "global.createUser";
    const permissions = await repository.getGlobalPermissions();
    const isAuthorized = identitiesAuthorizedFor(permissions, intent).some(identity =>
      canAssumeIdentity(creatingUser, identity),
    );
    if (!isAuthorized) {
      return new NotAuthorized({ ctx, userId: creatingUser.id, intent });
    }
  }

  eventTemplate.passwordHash = await repository.hash(data.passwordPlaintext);

  // Every user gets her own address:
  const keyPair = await repository.createKeyPair();
  eventTemplate.address = keyPair.address;
  eventTemplate.encryptedPrivKey = await repository.encrypt(keyPair.privkey);

  // Check that the event is valid by trying to "apply" it:
  const result = UserCreated.createFrom(ctx, createEvent);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, createEvent, [result]);
  }

  // Create events that'll grant default permissions to the user:
  const defaultPermissionGrantedEvents = userDefaultIntents.map(intent =>
    GlobalPermissionGranted.createEvent(ctx.source, publisher, intent, createEvent.user.id),
  );

  return [createEvent, ...defaultPermissionGrantedEvents];
}
