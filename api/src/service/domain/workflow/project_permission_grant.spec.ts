import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as Project from "./project";
import * as ProjectPermissionGrant from "./project_permission_grant";

const ctx: Ctx = { requestId: "", source: "test" };
const executingUser: ServiceUser = { id: "mstein", groups: [] };
const testUser: ServiceUser = { id: "testUser", groups: [] };

const permissions: Permissions = {
  "project.viewSummary": ["testUser"],
  "project.viewDetails": [],
  "project.intent.revokePermission": ["testUser"],
  "project.intent.grantPermission": ["mstein"],
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

describe("grant project permissions", () => {
  it("With the 'project.intent.grantPermission' permission, the user can grant project permissions", async () => {
    const grantResult = await ProjectPermissionGrant.grantProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.viewDetails",
      {
        getProject: async () => testProject,
      },
    );

    if (Result.isErr(grantResult)) {
      throw grantResult;
    }
    assert.lengthOf(grantResult, 1);
    const grantEvent = grantResult[0];
    const expectedEvent: BusinessEvent = {
      type: "project_permission_granted",
      source: ctx.source,
      publisher: executingUser.id,
      time: grantEvent.time,
      projectId: testProject.id,
      permission: "project.viewDetails",
      grantee: testUser.id,
    };
    assert.deepEqual(expectedEvent, grantEvent);
  });

  it("Without the 'project.intent.grantPermission' permission, the user cannot grant project permissions", async () => {
    const projectWithoutPermission: Project.Project = {
      id: "testProject",
      createdAt: new Date().toISOString(),
      status: "open",
      assignee: executingUser.id,
      displayName: "unitTestName",
      description: "",
      projectedBudgets: [],
      permissions: { "project.intent.grantPermission": [] },
      log: [],
      additionalData: {},
      tags: [],
    };
    const grantResult = await ProjectPermissionGrant.grantProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.viewDetails",
      {
        getProject: async () => projectWithoutPermission,
      },
    );

    assert.isTrue(Result.isErr(grantResult));
    assert.instanceOf(grantResult, NotAuthorized);
  });
});
describe("grant project permission: preconditions", () => {
  it("Granting project's permission fails if the project cannot be found", async () => {
    const grantResult = await ProjectPermissionGrant.grantProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.viewDetails",
      {
        getProject: async () => new Error("some error"),
      },
    );
    assert.isTrue(Result.isErr(grantResult));
    assert.instanceOf(grantResult, NotFound);
  });
  it("No changes to existing permissions emit no new events", async () => {
    const existingPermissions: Permissions = {
      "project.viewSummary": ["testUser"],
      "project.viewDetails": ["testUser"],
      "project.intent.revokePermission": ["testUser"],
      "project.intent.grantPermission": ["mstein"],
    };
    const baseProject: Project.Project = {
      ...testProject,
      permissions: existingPermissions,
    };
    const grantResult = await ProjectPermissionGrant.grantProjectPermission(
      ctx,
      executingUser,
      testProject.id,
      testUser.id,
      "project.viewDetails",
      {
        getProject: async () => baseProject,
      },
    );

    assert.deepEqual([], grantResult);
  });
});
