import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { AlreadyExists } from "../errors/already_exists";
import { NotAuthorized } from "../errors/not_authorized";
import * as GlobalPermissions from "../workflow/global_permissions";
import { createGroup, RequestData } from "./group_create";
import { ServiceUser } from "./service_user";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const groupId = "group-id";
const dummy = "dummy";

const noPermissions = {
  permissions: {},
  log: [],
};
const grantPermissions: GlobalPermissions.GlobalPermissions = {
  permissions: { "global.createGroup": ["alice"] },
  log: [],
};

const requestData: RequestData = {
  id: groupId,
  displayName: dummy,
  description: dummy,
  members: [alice.id, bob.id],
};

const baseRepository = {
  getGlobalPermissions: () => Promise.resolve(noPermissions),
  groupExists: () => Promise.resolve(false),

};

describe("Create a new group: authorization", () => {
  it("Without the global.createGroup permission, a user cannot create a new group", async () => {
    const result = await createGroup(ctx, alice, requestData, baseRepository);
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("With the global.createGroup permission, a user can create a new group", async () => {
    const result = await createGroup(ctx, alice, requestData,
      {
        ...baseRepository,
        getGlobalPermissions: () => Promise.resolve(grantPermissions),
      });
    assert.isTrue(Result.isOk(result));
  });

  it("The root user can always create a new user", async () => {
    const result = await createGroup(ctx, root, requestData, baseRepository);
    assert.isTrue(Result.isOk(result));
  });
});

describe("Create a new group: conditions", () => {
  it("Group that already exists cannot be created", async () => {
    const result = await createGroup(ctx, root, requestData, {
      ...baseRepository,
      groupExists: groupId => Promise.resolve(true),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, AlreadyExists);
  });
});
