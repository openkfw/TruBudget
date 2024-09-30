import { assert } from "chai";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";

import { revokeGlobalPermission } from "./global_permission_revoke";
import * as GlobalPermissions from "./global_permissions";

const ctx: Ctx = { requestId: "", source: "test" };
const address = "address";
const root: ServiceUser = { id: "root", groups: [], address };
const bob: ServiceUser = {
  id: "bob",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address,
};
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"], address };
const orgaA = "orgaA";
const orgaB = "orgaB";
const revokeIntent: Intent = "global.revokePermission";
const basePermissions: GlobalPermissions.GlobalPermissions = {
  permissions: {},
  log: [],
};
const revokePermissions: GlobalPermissions.GlobalPermissions = {
  permissions: { "global.revokePermission": ["bob"] },
  log: [],
};
const baseUser: UserRecord.UserRecord = {
  id: "dummy",
  createdAt: new Date().toISOString(),
  displayName: "dummy",
  organization: orgaA,
  passwordHash: "12345",
  address: "12345",
  encryptedPrivKey: "12345",
  permissions: {},
  log: [],
  additionalData: {},
};

const baseRepository = {
  getGlobalPermissions: async (): Promise<GlobalPermissions.GlobalPermissions> => basePermissions,
  isGroup: async (): Promise<boolean> => false,
  getUser: async (): Promise<UserRecord.UserRecord> => baseUser,
};

describe("Revoke global permissions: authorization and conditions", () => {
  it("The root user can always revoke global permissions for users within the same organization", async () => {
    const revokee: Identity = "alice";
    const result = await revokeGlobalPermission(
      ctx,
      root,
      orgaA,
      revokee,
      revokeIntent,
      baseRepository,
    );

    assert.isTrue(Result.isOk(result));
  });

  it("A user (including root) cannot revoke global permissions to users from other organizations", async () => {
    const revokee: Identity = "alice";
    const result = await revokeGlobalPermission(
      ctx,
      root,
      orgaB,
      revokee,
      revokeIntent,
      baseRepository,
    );

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("Without the 'global.intent.revokePermission' permission, the user cannot revoke global permissions", async () => {
    const revokee: Identity = "alice";
    const result = await revokeGlobalPermission(
      ctx,
      charlie,
      orgaA,
      revokee,
      revokeIntent,
      baseRepository,
    );

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it(
    "When a user has the 'global.intent.revokePermission' permission, " +
      "he/she can revoke global permissions",
    async () => {
      const revokee: Identity = "alice";
      const result = await revokeGlobalPermission(ctx, bob, orgaA, revokee, revokeIntent, {
        ...baseRepository,
        getGlobalPermissions: async () => {
          return revokePermissions;
        },
      });

      assert.isTrue(Result.isOk(result));
    },
  );

  it("If the revokee is a group, global permissions cannot be revoked", async () => {
    const revokee: Identity = "alice";
    const result = await revokeGlobalPermission(ctx, bob, orgaA, revokee, revokeIntent, {
      ...baseRepository,
      isGroup: async () => true,
    });

    assert.isTrue(Result.isErr(result));
  });
});
