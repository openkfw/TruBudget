import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import { enableUser, RequestData } from "./user_enable";
import { UserRecord } from "./user_record";
import * as GlobalPermissions from "../workflow/global_permissions";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const admin: ServiceUser = { id: "admin", groups: [] };
const member: ServiceUser = { id: "member", groups: [] };
const orgaA = "orgaA";
const otherOrganization = "otherOrganization";

const basePermissions: GlobalPermissions.GlobalPermissions = {
  permissions: { "global.enableUser": ["admin"] },
  log: [],
};

const baseUser: UserRecord = {
  id: "baseUser",
  createdAt: new Date().toISOString(),
  displayName: "baseUser",
  organization: orgaA,
  passwordHash: "12345",
  address: "12345",
  encryptedPrivKey: "12345",
  permissions: {},
  log: [],
  additionalData: {},
};

const requestData: RequestData = {
  userId: "baseUser",
};

const baseRepository = {
  getGlobalPermissions: async () => basePermissions,
  getUser: async () => baseUser,
};

describe("enable users: permissions", () => {
  it("Without the global.enableUser permission, a user cannot enable users", async () => {
    const result = await enableUser(ctx, member, orgaA, requestData, {
      ...baseRepository,
    });

    // NotAuthorized error due to the missing permissions:
    assert.isTrue(Result.isErr(result), "Charlie is not authorized to enable users");
    assert.instanceOf(result, NotAuthorized, "The error is of the type 'Not Authorized'");
  });

  it("The root user doesn't need permission to enable users", async () => {
    const result = await enableUser(ctx, root, orgaA, requestData, {
      ...baseRepository,
    });
    assert.isTrue(Result.isOk(result));
  });

  it("A user can enable users if the correct permissions are given", async () => {
    const result = await enableUser(ctx, admin, orgaA, requestData, {
      ...baseRepository,
    });
    if (Result.isErr(result)) {
      throw result;
    }
    assert.isTrue(Result.isOk(result));
    assert.isTrue(result.length > 0);
  });

  it("Root user cannot enable users from other organizations", async () => {
    const result = await enableUser(ctx, root, otherOrganization, requestData, {
      ...baseRepository,
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized, "The error is of the type 'Not Authorized'");
  });

  it("A user cannot enable users from other organizations", async () => {
    const result = await enableUser(ctx, admin, otherOrganization, requestData, {
      ...baseRepository,
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized, "The error is of the type 'Not Authorized'");
  });
});
