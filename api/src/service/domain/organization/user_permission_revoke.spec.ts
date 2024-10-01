import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";

import { newUserFromEvent } from "./user_eventsourcing";
import { revokeUserPermission } from "./user_permission_revoke";
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
  permissions: { "user.intent.revokePermission": [alice.id] },
  address: "12345",
  encryptedPrivKey: "encrypted",
  log: [],
  additionalData: {},
};

const baseRepository = {
  getTargetUser: async (): Promise<UserRecord> => baseUser,
};

describe("Revoking user permissions: permissions", () => {
  it("Without the user.intent.revokePermission permission, a user cannot revoke user permissions", async () => {
    const result = await revokeUserPermission(
      ctx,
      alice,
      organizationName,
      userId,
      bob.id,
      grantIntent,
      {
        getTargetUser: async () =>
          Promise.resolve({
            ...baseUser,
            permissions: { "user.intent.grantPermission": [alice.id] },
          }),
      },
    );

    // NotAuthorized error due to the missing permissions:
    assert.isTrue(Result.isErr(result), "Alice is not authorized to grant this permission");
    assert.instanceOf(result, NotAuthorized, "The error is of the type 'Not Authorized'");
  });

  it("The root user can always revoke user permissions", async () => {
    const result = await revokeUserPermission(
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

describe("Revoking user permissions: updates", () => {
  it("The permission is revoked if the user has the correct permissions", async () => {
    const permissionTestUser: UserRecord = {
      ...baseUser,
      permissions: {
        "user.intent.revokePermission": [alice.id],
        "user.intent.grantPermission": [bob.id],
      },
    };
    const result = await revokeUserPermission(
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

    const userAfterRevokingPermission = result.reduce(
      (user, event) => newUserFromEvent(ctx, user, event),
      baseUser,
    );
    if (Result.isErr(userAfterRevokingPermission)) {
      throw userAfterRevokingPermission;
    }

    assert.isTrue(Result.isOk(result), "Alice is authorized to grant this permission");
    assert.isTrue(result.length > 0, "An event is created");
    // Permission that was revoked does not exist anymore
    assert.isFalse(userAfterRevokingPermission.permissions.hasOwnProperty(grantIntent));
    // Alice still has the permission to revoke permissions
    assert.isTrue(
      userAfterRevokingPermission.permissions["user.intent.revokePermission"]!.some(
        (x) => x === alice.id,
      ),
    );
  });

  it("A not existing permission is revoked, nothing happens", async () => {
    const testIntent = "user.changePassword";
    const permissionTestUser: UserRecord = {
      ...baseUser,
      permissions: {
        "user.intent.revokePermission": [alice.id],
      },
    };
    const result = await revokeUserPermission(
      ctx,
      alice,
      organizationName,
      userId,
      alice.id,
      testIntent,
      {
        getTargetUser: async () => Promise.resolve(permissionTestUser),
      },
    );
    if (Result.isErr(result)) {
      throw result;
    }

    const userAfterRevokingPermission = result.reduce(
      (user, event) => newUserFromEvent(ctx, user, event),
      baseUser,
    );
    if (Result.isErr(userAfterRevokingPermission)) {
      throw userAfterRevokingPermission;
    }

    assert.isTrue(Result.isOk(result), "Alice is authorized to revoke this permission");
    assert.deepEqual(result, []);
    // Alice still has the permission to revoke permissions
    assert.isTrue(
      userAfterRevokingPermission.permissions["user.intent.revokePermission"]!.some(
        (x) => x === alice.id,
      ),
    );
  });
});
