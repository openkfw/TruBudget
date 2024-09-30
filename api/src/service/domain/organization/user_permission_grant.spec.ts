import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";

import { newUserFromEvent } from "./user_eventsourcing";
import { grantUserPermission } from "./user_permission_grant";
import { UserRecord } from "./user_record";

const ctx: Ctx = { requestId: "", source: "test" };
const address = "address";
const root: ServiceUser = { id: "root", groups: [], address };
const alice: ServiceUser = {
  id: "alice",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address,
};
const bob: ServiceUser = {
  id: "bob",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address,
};

const organizationName = "dummyOrganization";
const grantIntent = "user.intent.grantPermission";
const userId = "dummy";

const baseUser: UserRecord = {
  id: userId,
  createdAt: new Date().toISOString(),
  organization: organizationName,
  displayName: "dummy",
  passwordHash: "password",
  permissions: {},
  address: "12345",
  encryptedPrivKey: "encrypted",
  log: [],
  additionalData: {},
};

const baseRepository = {
  getTargetUser: async (): Promise<UserRecord> => baseUser,
};

describe("Granting user permissions: permissions", () => {
  it("Without the user.intent.grantPermission permission, a user cannot grant user permissions", async () => {
    const result = await grantUserPermission(
      ctx,
      alice,
      organizationName,
      userId,
      bob.id,
      grantIntent,
      {
        ...baseRepository,
      },
    );

    // NotAuthorized error due to the missing permissions:
    assert.isTrue(Result.isErr(result), "Alice is not authorized to grant this permission");
    assert.instanceOf(result, NotAuthorized, "The error is of the type 'Not Authorized'");
  });

  it("The root user can always grant user permissions", async () => {
    const result = await grantUserPermission(
      ctx,
      root,
      organizationName,
      userId,
      bob.id,
      grantIntent,
      {
        ...baseRepository,
      },
    );

    assert.isTrue(Result.isOk(result));
  });
});

describe("Granting user permissions: updates", () => {
  it("The permission is granted if the user has the correct permissions", async () => {
    const permissionTestUser: UserRecord = {
      ...baseUser,
      permissions: { "user.intent.grantPermission": [alice.id] },
    };
    const result = await grantUserPermission(
      ctx,
      alice,
      organizationName,
      userId,
      bob.id,
      grantIntent,
      {
        getTargetUser: async () => Promise.resolve(permissionTestUser),
      },
    );
    if (Result.isErr(result)) {
      throw result;
    }

    const userAfterGrantingPermission = result.reduce(
      (user, event) => newUserFromEvent(ctx, user, event),
      permissionTestUser,
    );
    if (Result.isErr(userAfterGrantingPermission)) {
      throw userAfterGrantingPermission;
    }

    assert.isTrue(Result.isOk(result), "Alice is authorized to grant this permission");
    // Bob now has the permission
    assert.isTrue(
      userAfterGrantingPermission.permissions["user.intent.grantPermission"]!.some(
        (x) => x === bob.id,
      ),
    );
    // Alice still has the permission
    assert.isTrue(
      userAfterGrantingPermission.permissions["user.intent.grantPermission"]!.some(
        (x) => x === alice.id,
      ),
    );
  });

  it("An existing permission is granted, nothing happens", async () => {
    const testUser: UserRecord = {
      id: userId,
      createdAt: new Date().toISOString(),
      organization: organizationName,
      displayName: "dummy",
      passwordHash: "password",
      permissions: { "user.intent.grantPermission": [alice.id] },
      address: "12345",
      encryptedPrivKey: "encrypted",
      log: [],
      additionalData: {},
    };
    const result = await grantUserPermission(
      ctx,
      alice,
      organizationName,
      userId,
      alice.id,
      grantIntent,
      {
        getTargetUser: async () => Promise.resolve(testUser),
      },
    );
    if (Result.isErr(result)) {
      throw result;
    }

    const userAfterGrantingPermission = result.reduce(
      (user, event) => newUserFromEvent(ctx, user, event),
      testUser,
    );
    if (Result.isErr(userAfterGrantingPermission)) {
      throw userAfterGrantingPermission;
    }

    assert.isTrue(Result.isOk(result), "Alice is authorized to grant this permission");
    assert.deepEqual(result, []);
    // Alice still has the permission
    assert.isTrue(
      userAfterGrantingPermission.permissions["user.intent.grantPermission"]!.some(
        (x) => x === alice.id,
      ),
    );
  });
});
