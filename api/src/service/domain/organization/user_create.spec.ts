import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { AlreadyExists } from "../errors/already_exists";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "./service_user";
import { createUser, RequestData } from "./user_create";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };

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
  getGlobalPermissions: () => Promise.resolve(noPermissions),
  userExists: (userId) => Promise.resolve(false),
  organizationExists: (organization) => Promise.resolve(true),
  createKeyPair: () => Promise.resolve(dummyKeyPair),
  hash: (plaintext) => Promise.resolve("dummyHash"),
  encrypt: (plaintext) => Promise.resolve("dummyEncrypted"),
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

  it("User without an existing organization cannot be created", async () => {
    const result = await createUser(ctx, root, requestData, {
      ...baseRepository,
      organizationExists: (organization) => Promise.resolve(false),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });
});
