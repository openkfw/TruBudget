import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as Project from "./project";
import * as ProjectPermissionRevoke from "./project_permission_revoke";

const ctx: Ctx = { requestId: "", source: "test" };
const executingUser: ServiceUser = { id: "mstein", groups: [] };
const testUser: ServiceUser = { id: "testUser", groups: [] };

const permissions: Permissions = {
  "project.viewSummary": ["testUser"],
  "project.viewDetails": ["testUser"],
  "project.intent.grantPermission": ["testUser"],
  "project.intent.revokePermission": ["mstein"],
};

const testProject: Project.Project = {
  id: "testProject",
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: executingUser.id,
  displayName: "unitTestName",
  description: "",
  projectedBudgets: [],
  permissions,
  log: [],
  additionalData: {},
  tags: [],
};

describe("revoke project permissions", () => {
  it("With the 'project.intent.revokePermission' permission, the user can revoke project permissions", async () => {
    const revokeResult = await ProjectPermissionRevoke.revokeProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.viewDetails",
      {
        getProject: async () => testProject,
      },
    );

    if (Result.isErr(revokeResult)) {
      throw revokeResult;
    }
    assert.lengthOf(revokeResult, 1);
    const revokeEvent = revokeResult[0];
    const expectedEvent: BusinessEvent = {
      type: "project_permission_revoked",
      source: ctx.source,
      publisher: executingUser.id,
      time: revokeEvent.time,
      projectId: testProject.id,
      permission: "project.viewDetails",
      revokee: testUser.id,
    };
    assert.deepEqual(expectedEvent, revokeEvent);
  });

  it("Without the 'project.intent.revokePermission' permission, the user cannot revoke project permissions", async () => {
    const projectWithoutPermission: Project.Project = {
      id: "testProject",
      createdAt: new Date().toISOString(),
      status: "open",
      assignee: executingUser.id,
      displayName: "unitTestName",
      description: "",
      projectedBudgets: [],
      permissions: { "project.intent.revokePermission": [] },
      log: [],
      additionalData: {},
      tags: [],
    };
    const revokeResult = await ProjectPermissionRevoke.revokeProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.viewDetails",
      {
        getProject: async () => projectWithoutPermission,
      },
    );

    assert.isTrue(Result.isErr(revokeResult));
    assert.instanceOf(revokeResult, NotAuthorized);
  });

  it("Revoking grantPermission permission of last user is not allowed and leads to a precondition error.", async () => {
    const revokeResult = await ProjectPermissionRevoke.revokeProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.intent.grantPermission",
      {
        getProject: async () => testProject,
      },
    );

    assert.isTrue(Result.isErr(revokeResult));
    assert.instanceOf(revokeResult, PreconditionError);
  });
});
describe("revoke project permission: preconditions", () => {
  it("Revoking a project's permission fails if the project cannot be found", async () => {
    const revokeResult = await ProjectPermissionRevoke.revokeProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.viewDetails",
      {
        getProject: async () => new Error("some error"),
      },
    );
    assert.isTrue(Result.isErr(revokeResult));
    assert.instanceOf(revokeResult, NotFound);
  });
  it("No changes to existing permissions emit no new events", async () => {
    const existingPermissions: Permissions = {
      "project.viewSummary": ["testUser"],
      "project.viewDetails": [],
      "project.intent.grantPermission": ["testUser"],
      "project.intent.revokePermission": ["mstein"],
    };
    const baseProject: Project.Project = {
      ...testProject,
      permissions: existingPermissions,
    };
    const revokeResult = await ProjectPermissionRevoke.revokeProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.viewDetails",
      {
        getProject: async () => baseProject,
      },
    );

    assert.deepEqual([], revokeResult);
  });
});
