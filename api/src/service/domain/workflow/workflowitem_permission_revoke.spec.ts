import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemPermissionRevoke from "./workflowitem_permission_revoke";

const ctx: Ctx = { requestId: "", source: "test" };
const executingUser: ServiceUser = { id: "mstein", groups: [] };
const testUser: ServiceUser = { id: "testUser", groups: [] };
const projectId = "testProject";

const permissions: Permissions = {
  "workflowitem.view": ["testUser"],
  "workflowitem.assign": ["testUser"],
  "workflowitem.intent.grantPermission": ["testUser"],
  "workflowitem.intent.revokePermission": ["mstein"],
};

const testworkflowitem: Workflowitem.Workflowitem = {
  isRedacted: false,
  id: "testworkflowitem",
  subprojectId: "testSubproject",
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: "unitTestName",
  description: "",
  amountType: "N/A",
  documents: [],
  permissions,
  log: [],
  additionalData: {},
};

describe("revoke workflowitem permissions", () => {
  it("With the 'workflowitem.intent.revokePermission' permission, the user can revoke workflowitem permissions", async () => {
    const revokeResult = await WorkflowitemPermissionRevoke.revokeWorkflowitemPermission(
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

    if (Result.isErr(revokeResult)) {
      throw revokeResult;
    }
    assert.lengthOf(revokeResult.newEvents, 1);
    const revokeEvent = revokeResult.newEvents[0];
    const expectedEvent: BusinessEvent = {
      type: "workflowitem_permission_revoked",
      source: ctx.source,
      publisher: executingUser.id,
      time: revokeEvent.time,
      projectId: projectId,
      subprojectId: testworkflowitem.subprojectId,
      workflowitemId: testworkflowitem.id,
      permission: "workflowitem.assign",
      revokee: testUser.id,
    };
    assert.deepEqual(expectedEvent, revokeEvent);
  });

  it("Without the 'workflowitem.intent.revokePermission' permission, the user cannot revoke workflowitem permissions", async () => {
    const workflowitemWithoutPermission: Workflowitem.Workflowitem = {
      isRedacted: false,
      id: "testworkflowitem",
      subprojectId: "testsubProject",
      createdAt: new Date().toISOString(),
      status: "open",
      displayName: "unitTestName",
      amountType: "N/A",
      description: "",
      documents: [],
      permissions: { "workflowitem.intent.revokePermission": [] },
      log: [],
      additionalData: {},
    };
    const revokeResult = await WorkflowitemPermissionRevoke.revokeWorkflowitemPermission(
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

    assert.isTrue(Result.isErr(revokeResult));
    assert.instanceOf(revokeResult, NotAuthorized);
  });

  it("Revoking grantPermission permission of last user is not allowed and leads to a precondition error.", async () => {
    const revokeResult = await WorkflowitemPermissionRevoke.revokeWorkflowitemPermission(
      ctx,
      executingUser,
      projectId,
      testworkflowitem.subprojectId,
      testworkflowitem.id,
      testUser.id,
      "workflowitem.intent.grantPermission",
      {
        getWorkflowitem: async () => testworkflowitem,
      },
    );

    assert.isTrue(Result.isErr(revokeResult));
    assert.instanceOf(revokeResult, PreconditionError);
  });
});
