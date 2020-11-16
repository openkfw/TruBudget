import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemPermissionGrant from "./workflowitem_permission_grant";

const ctx: Ctx = { requestId: "", source: "test" };
const executingUser: ServiceUser = { id: "mstein", groups: [] };
const testUser: ServiceUser = { id: "testUser", groups: [] };
const projectId = "testProject";

const permissions: Permissions = {
  "workflowitem.view": [],
  "workflowitem.assign": [],
  "workflowitem.intent.revokePermission": ["testUser"],
  "workflowitem.intent.grantPermission": ["mstein"],
};

const testworkflowitem: Workflowitem.Workflowitem = {
  isRedacted: false,
  id: "testworkflowitem",
  subprojectId: "testSubproject",
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: executingUser.id,
  displayName: "unitTestName",
  description: "",
  amountType: "N/A",
  documents: [],
  permissions,
  log: [],
  additionalData: {},
};

describe("grant workflowitem permissions", () => {
  it("With the 'workflowitem.intent.grantPermission' permission, the user can grant workflowitem permissions", async () => {
    const grantResult = await WorkflowitemPermissionGrant.grantWorkflowitemPermission(
      ctx,
      executingUser,
      projectId,
      testworkflowitem.subprojectId,
      testworkflowitem.id,
      testUser.id,
      "workflowitem.assign",
      {
        getWorkflowitem: async () => testworkflowitem,
      },
    );

    if (Result.isErr(grantResult)) {
      throw grantResult;
    }
    const newEvents = grantResult;
    assert.lengthOf(newEvents, 1);
    const grantEvent = newEvents[0];
    const expectedEvent: BusinessEvent = {
      type: "workflowitem_permission_granted",
      source: ctx.source,
      publisher: executingUser.id,
      time: grantEvent.time,
      projectId: projectId,
      subprojectId: testworkflowitem.subprojectId,
      workflowitemId: testworkflowitem.id,
      permission: "workflowitem.assign",
      grantee: testUser.id,
    };
    assert.deepEqual(expectedEvent, grantEvent);
  });

  it("Without the 'workflowitem.intent.grantPermission' permission, the user cannot grant workflowitem permissions", async () => {
    const workflowitemWithoutPermission: Workflowitem.Workflowitem = {
      isRedacted: false,
      id: "testworkflowitem",
      subprojectId: "testsubProject",
      createdAt: new Date().toISOString(),
      status: "open",
      assignee: executingUser.id,
      displayName: "unitTestName",
      amountType: "N/A",
      description: "",
      documents: [],
      permissions: { "workflowitem.intent.grantPermission": [] },
      log: [],
      additionalData: {},
    };
    const grantResult = await WorkflowitemPermissionGrant.grantWorkflowitemPermission(
      ctx,
      executingUser,
      projectId,
      testworkflowitem.subprojectId,
      testworkflowitem.id,
      testUser.id,
      "workflowitem.view",
      {
        getWorkflowitem: async () => workflowitemWithoutPermission,
      },
    );

    assert.isTrue(Result.isErr(grantResult));
    assert.instanceOf(grantResult, NotAuthorized);
  });
});
describe("grant workflowitem permission: preconditions", () => {
  it("Granting a workflowitem's permission fails if the workflowitem cannot be found", async () => {
    const grantResult = await WorkflowitemPermissionGrant.grantWorkflowitemPermission(
      ctx,
      executingUser,
      projectId,
      testworkflowitem.subprojectId,
      testworkflowitem.id,
      testUser.id,
      "workflowitem.view",
      {
        getWorkflowitem: async () => new Error("some error"),
      },
    );
    assert.isTrue(Result.isErr(grantResult));
    assert.instanceOf(grantResult, NotFound);
  });
  it("No changes to existing permissions emit no new events", async () => {
    const existingPermissions: Permissions = {
      "workflowitem.view": ["testUser"],
      "workflowitem.assign": [],
      "workflowitem.intent.grantPermission": ["mstein"],
    };
    const baseWorkflowitem: Workflowitem.Workflowitem = {
      ...testworkflowitem,
      permissions: existingPermissions,
    };
    const grantResult = await WorkflowitemPermissionGrant.grantWorkflowitemPermission(
      ctx,
      executingUser,
      projectId,
      testworkflowitem.subprojectId,
      testworkflowitem.id,
      testUser.id,
      "workflowitem.view",
      {
        getWorkflowitem: async () => baseWorkflowitem,
      },
    );

    assert.deepEqual([], grantResult);
  });
});
