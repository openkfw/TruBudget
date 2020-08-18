import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as Subproject from "./subproject";
import * as SubprojectPermissionGrant from "./subproject_permission_grant";

const ctx: Ctx = { requestId: "", source: "test" };
const executingUser: ServiceUser = { id: "mstein", groups: [] };
const testUser: ServiceUser = { id: "testUser", groups: [] };

const permissions: Permissions = {
  "subproject.viewSummary": ["testUser"],
  "subproject.viewDetails": [],
  "subproject.intent.revokePermission": ["testUser"],
  "subproject.intent.grantPermission": ["mstein"],
};

const testsubproject: Subproject.Subproject = {
  id: "testsubproject",
  projectId: "testProject",
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: "unitTestName",
  description: "",
  currency: "EUR",
  workflowitemOrdering: [],
  projectedBudgets: [],
  permissions,
  log: [],
  additionalData: {},
};

describe("grant subproject permissions", () => {
  it("With the 'subproject.intent.grantPermission' permission, the user can grant subproject permissions",
  async () => {
    const grantResult = await SubprojectPermissionGrant.grantSubprojectPermission(
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

    if (Result.isErr(grantResult)) {
      throw grantResult;
    }
    const newEvents = grantResult;
    assert.lengthOf(newEvents, 1);
    const grantEvent = newEvents[0];
    const expectedEvent: BusinessEvent = {
      type: "subproject_permission_granted",
      source: ctx.source,
      publisher: executingUser.id,
      time: grantEvent.time,
      projectId: testsubproject.projectId,
      subprojectId: testsubproject.id,
      permission: "subproject.viewDetails",
      grantee: testUser.id,
    };
    assert.deepEqual(expectedEvent, grantEvent);
  });

  it("Without the 'subproject.intent.grantPermission' permission, the user cannot grant subproject permissions",
  async () => {
    const subprojectWithoutPermission: Subproject.Subproject = {
      id: "testsubproject",
      projectId: "testProject",
      createdAt: new Date().toISOString(),
      status: "open",
      displayName: "unitTestName",
      description: "",
      currency: "EUR",
      workflowitemOrdering: [],
      projectedBudgets: [],
      permissions: { "subproject.intent.grantPermission": [] },
      log: [],
      additionalData: {},
    };
    const grantResult = await SubprojectPermissionGrant.grantSubprojectPermission(
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

    assert.isTrue(Result.isErr(grantResult));
    assert.instanceOf(grantResult, NotAuthorized);
  });
});
