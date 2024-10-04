import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { AlreadyExists } from "../errors/already_exists";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import * as GlobalPermissions from "../workflow/global_permissions";

import { KeyPair } from "./key_pair";
import { ServiceUser } from "./service_user";
import { createUser, RequestData } from "./user_create";

const ctx: Ctx = { requestId: "", source: "test" };
const address = "address";
const root: ServiceUser = { id: "root", groups: [], address };
const alice: ServiceUser = {
  id: "alice",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address,
};
const dummy = "dummy";

const noPermissions = {
  permissions: {},
  log: [],
};

const requestData: RequestData = {
  userId: dummy,
  displayName: dummy,
  organization: dummy,
  passwordPlaintext: "test",
};

const dummyKeyPair = {
  address: "dummyAddress",
  pubkey: "dummyPubKey",
  privkey: "dummyPrivKey",
};

const baseRepository = {
  getGlobalPermissions: (): Promise<GlobalPermissions.GlobalPermissions> =>
    Promise.resolve(noPermissions),
  userExists: (userId): Promise<boolean> => Promise.resolve(false),
  groupExists: (userId): Promise<boolean> => Promise.resolve(false),
  organizationExists: (organization): Promise<boolean> => Promise.resolve(true),
  createKeyPair: (): Promise<KeyPair> => Promise.resolve(dummyKeyPair),
  hash: (plaintext): Promise<string> => Promise.resolve("dummyHash"),
  encrypt: (plaintext): Promise<string> => Promise.resolve("dummyEncrypted"),
};

describe("Create a new user: authorization", () => {
  it("Without the global.createUser permission, a user cannot create a new user", async () => {
    const result = await createUser(ctx, alice, requestData, baseRepository);
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("The root user can always create a new user", async () => {
    const result = await createUser(ctx, root, requestData, baseRepository);
    assert.isTrue(Result.isOk(result));
  });
});

describe("Create a new user: conditions", () => {
  it("User with ID 'root' cannot be created", async () => {
    const result = await createUser(ctx, root, { ...requestData, userId: "root" }, baseRepository);
    assert.isTrue(Result.isErr(result));
  });

  it("User that already exists cannot be created", async () => {
    const result = await createUser(ctx, root, requestData, {
      ...baseRepository,
      userExists: (userId) => Promise.resolve(true),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, AlreadyExists);
  });

  it("User cannot be created if group with that id exists", async () => {
    const result = await createUser(ctx, root, requestData, {
      ...baseRepository,
      groupExists: (userId) => Promise.resolve(true),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, AlreadyExists);
  });

  it("User without an existing organization cannot be created", async () => {
    const result = await createUser(ctx, root, requestData, {
      ...baseRepository,
      organizationExists: (organization) => Promise.resolve(false),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });
});
