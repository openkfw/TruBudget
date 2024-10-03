import { assert } from "chai";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";

import { grantGlobalPermission } from "./global_permission_grant";
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
const grantIntent: Intent = "global.grantPermission";
const basePermissions: GlobalPermissions.GlobalPermissions = {
  permissions: {},
  log: [],
};
const grantPermissions: GlobalPermissions.GlobalPermissions = {
  permissions: { "global.grantPermission": ["bob"] },
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

describe("Grant global permissions: authorization and conditions", () => {
  it("The root user can always grant global permissions for users within the same organization", async () => {
    const grantee: Identity = "alice";
    const result = await grantGlobalPermission(
      ctx,
      root,
      orgaA,
      grantee,
      grantIntent,
      baseRepository,
    );

    assert.isTrue(Result.isOk(result));
  });

  it("A user (including root) cannot grant global permissions to users from other organizations", async () => {
    const grantee: Identity = "alice";
    const result = await grantGlobalPermission(
      ctx,
      root,
      orgaB,
      grantee,
      grantIntent,
      baseRepository,
    );

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("Without the 'global.intent.grantPermission' permission, the user cannot grant global permissions", async () => {
    const grantee: Identity = "alice";
    const result = await grantGlobalPermission(
      ctx,
      charlie,
      orgaA,
      grantee,
      grantIntent,
      baseRepository,
    );

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it(
    "When a user has the 'global.intent.grantPermission' permission, " +
      "he/she can grant global permissions",
    async () => {
      const grantee: Identity = "alice";
      const result = await grantGlobalPermission(ctx, bob, orgaA, grantee, grantIntent, {
        ...baseRepository,
        getGlobalPermissions: async () => {
          return grantPermissions;
        },
      });

      assert.isTrue(Result.isOk(result));
    },
  );

  it("If the grantee is a group, global permissions cannot be granted", async () => {
    const grantee: Identity = "alice";
    const result = await grantGlobalPermission(ctx, bob, orgaA, grantee, grantIntent, {
      ...baseRepository,
      isGroup: async () => true,
    });

    assert.isTrue(Result.isErr(result));
  });
});
