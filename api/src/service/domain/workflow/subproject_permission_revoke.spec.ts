import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as Subproject from "./subproject";
import * as SubprojectPermissionRevoke from "./subproject_permission_revoke";

const ctx: Ctx = { requestId: "", source: "test" };
const executingUser: ServiceUser = { id: "mstein", groups: [] };
const testUser: ServiceUser = { id: "testUser", groups: [] };

const permissions: Permissions = {
  "subproject.viewSummary": ["testUser"],
  "subproject.viewDetails": ["testUser"],
  "subproject.intent.grantPermission": ["testUser"],
  "subproject.intent.revokePermission": ["mstein"],
};

const testsubproject: Subproject.Subproject = {
  id: "testsubproject",
  projectId: "testProject",
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: executingUser.id,
  displayName: "unitTestName",
  description: "",
  currency: "EUR",
  workflowitemOrdering: [],
  projectedBudgets: [],
  permissions,
  log: [],
  additionalData: {},
};

describe("revoke subproject permissions", () => {
  it("With the 'subproject.intent.revokePermission' permission, the user can revoke subproject permissions", async () => {
    const revokeResult = await SubprojectPermissionRevoke.revokeSubprojectPermission(
      ctx,
      executingUser,
      testsubproject.projectId,
      testsubproject.id,
      testUser.id,
      "subproject.viewDetails",
      {
        getSubproject: async () => testsubproject,
      },
    );

    if (Result.isErr(revokeResult)) {
      throw revokeResult;
    }
    const newEvents = revokeResult;
    assert.lengthOf(newEvents, 1);
    const revokeEvent = newEvents[0];
    const expectedEvent: BusinessEvent = {
      type: "subproject_permission_revoked",
      source: ctx.source,
      publisher: executingUser.id,
      time: revokeEvent.time,
      projectId: testsubproject.projectId,
      subprojectId: testsubproject.id,
      permission: "subproject.viewDetails",
      revokee: testUser.id,
    };
    assert.deepEqual(expectedEvent, revokeEvent);
  });

  it("Without the 'subproject.intent.revokePermission' permission, the user cannot revoke subproject permissions", async () => {
    const subprojectWithoutPermission: Subproject.Subproject = {
      id: "testsubproject",
      projectId: "testProject",
      createdAt: new Date().toISOString(),
      status: "open",
      assignee: executingUser.id,
      displayName: "unitTestName",
      description: "",
      currency: "EUR",
      workflowitemOrdering: [],
      projectedBudgets: [],
      permissions: { "subproject.intent.revokePermission": [] },
      log: [],
      additionalData: {},
    };
    const revokeResult = await SubprojectPermissionRevoke.revokeSubprojectPermission(
      ctx,
      executingUser,
      testsubproject.projectId,
      testsubproject.id,
      testUser.id,
      "subproject.viewDetails",
      {
        getSubproject: async () => subprojectWithoutPermission,
      },
    );

    assert.isTrue(Result.isErr(revokeResult));
    assert.instanceOf(revokeResult, NotAuthorized);
  });

  it("Revoking grantPermission permission of last user is not allowed and leads to a precondition error.", async () => {
    const revokeResult = await SubprojectPermissionRevoke.revokeSubprojectPermission(
      ctx,
      executingUser,
      testsubproject.projectId,
      testsubproject.id,
      testUser.id,
      "subproject.intent.grantPermission",
      {
        getSubproject: async () => testsubproject,
      },
    );

    assert.isTrue(Result.isErr(revokeResult));
    assert.instanceOf(revokeResult, PreconditionError);
  });
  it("Revoking a subproject's permission fails if the subproject cannot be found", async () => {
    const revokeResult = await SubprojectPermissionRevoke.revokeSubprojectPermission(
      ctx,
      executingUser,
      testsubproject.projectId,
      testsubproject.id,
      testUser.id,
      "subproject.viewDetails",
      {
        getSubproject: async () => new Error("some error"),
      },
    );
    assert.isTrue(Result.isErr(revokeResult));
    assert.instanceOf(revokeResult, NotFound);
  });
  it("No changes to existing permissions emit no new events", async () => {
    const existingPermissions: Permissions = {
      "subproject.viewSummary": ["testUser"],
      "subproject.viewDetails": [],
      "subproject.intent.grantPermission": ["testUser"],
      "subproject.intent.revokePermission": ["mstein"],
    };
    const baseSubproject: Subproject.Subproject = {
      ...testsubproject,
      permissions: existingPermissions,
    };
    const revokeResult = await SubprojectPermissionRevoke.revokeSubprojectPermission(
      ctx,
      executingUser,
      testsubproject.projectId,
      testsubproject.id,
      testUser.id,
      "subproject.viewDetails",
      {
        getSubproject: async () => baseSubproject,
      },
    );

    assert.deepEqual([], revokeResult);
  });
});
