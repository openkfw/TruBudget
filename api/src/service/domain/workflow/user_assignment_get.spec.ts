import { assert } from "chai";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import { getUserAssignments } from "./user_assignments_get";
import * as GlobalPermissions from "./global_permissions";
import * as UserAssignments from "../workflow/user_assignments";
import * as Project from "../workflow/project";
import * as Subproject from "../workflow/subproject";
import * as Workflowitem from "../workflow/workflowitem";
import { HiddenAssignments } from "./user_assignments";
import { VError } from "verror";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const admin: ServiceUser = { id: "admin", groups: [] };
const member: ServiceUser = { id: "member", groups: [] };
const orgaA = "orgaA";
const otherOrganization = "otherOrganization";

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

const baseProject: Project.Project[] = [
  {
    assignee: member.id,
    id: "projectId",
    createdAt: new Date().toISOString(),
    status: "open",
    displayName: "baseUser",
    description: "baseUser",
    projectedBudgets: [],
    permissions: {},
    log: [],
    additionalData: {},
    tags: [],
  },
];

const baseSubproject: Subproject.Subproject[] = [
  {
    assignee: member.id,
    projectId: "projectId",
    id: "subprojectId",
    createdAt: new Date().toISOString(),
    status: "open",
    displayName: "baseUser",
    description: "baseUser",
    currency: "EUR",
    projectedBudgets: [],
    workflowitemOrdering: [],
    permissions: {},
    log: [],
    additionalData: {},
  },
];

const baseWorkflowitem: Workflowitem.Workflowitem[] = [
  {
    assignee: member.id,
    isRedacted: false,
    id: "workflowitemId",
    subprojectId: "subprojectId",
    createdAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    status: "open",
    displayName: "baseUser",
    description: "baseUser",
    amountType: "N/A",
    documents: [],
    permissions: {},
    log: [],
    additionalData: {},
    workflowitemType: "general",
  },
];

const baseRepository = {
  getAllProjects: async () => baseProject,
  getSubprojects: async () => baseSubproject,
  getWorkflowitems: async () => baseWorkflowitem,
  getUser: async () => baseUser,
};

describe("Get user assignments: authorization and conditions", () => {
  it("The root user can always view user assignments within the same organization", async () => {
    const result = await getUserAssignments(ctx, member.id, root, orgaA, { ...baseRepository });

    assert.isTrue(Result.isOk(result));
  });

  it("A user (including root) cannot view user assignments to users from other organizations", async () => {
    const result = await getUserAssignments(ctx, member.id, root, otherOrganization, {
      ...baseRepository,
    });

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("A user can always view user assignments of projects (returned as hidden)", async () => {
    const result = await getUserAssignments(ctx, member.id, admin, orgaA, {
      ...baseRepository,
      getAllProjects: async () => {
        return [{ ...baseProject[0] }];
      },
    });

    assert.isTrue(Result.isOk(result));
    if (Result.isErr(result)) {
      throw new VError(result, "global.listAssignments failed");
    }
    const userAssignments = result;
    assert.isTrue(
      userAssignments.hiddenAssignments !== undefined &&
        userAssignments.hiddenAssignments.hasHiddenProjects === true,
    );
  });

  it("A user can always view user assignments of subprojects (returned as hidden)", async () => {
    const result = await getUserAssignments(ctx, member.id, admin, orgaA, {
      ...baseRepository,
      getSubprojects: async () => {
        return [{ ...baseSubproject[0] }];
      },
    });

    assert.isTrue(Result.isOk(result));
    if (Result.isErr(result)) {
      throw new VError(result, "global.listAssignments failed");
    }
    const userAssignments = result;
    assert.isTrue(
      userAssignments.hiddenAssignments !== undefined &&
        userAssignments.hiddenAssignments.hasHiddenSubprojects === true,
    );
  });

  it("A user can always view user assignments of workflowitems (returned as hidden)", async () => {
    const result = await getUserAssignments(ctx, member.id, admin, orgaA, {
      ...baseRepository,
      getWorkflowitems: async () => {
        return [{ ...baseWorkflowitem[0] }];
      },
    });

    assert.isTrue(Result.isOk(result));
    if (Result.isErr(result)) {
      throw new VError(result, "global.listAssignments failed");
    }
    const userAssignments = result;
    assert.isTrue(
      userAssignments.hiddenAssignments !== undefined &&
        userAssignments.hiddenAssignments.hasHiddenWorkflowitems === true,
    );
  });

  it("A user can view user assignments of projects with view permissions", async () => {
    const result = await getUserAssignments(ctx, member.id, admin, orgaA, {
      ...baseRepository,
      getAllProjects: async () => {
        return [
          {
            ...baseProject[0],
            permissions: {
              "project.viewSummary": [admin.id],
              "project.viewDetails": [admin.id],
            },
          },
        ];
      },
    });

    assert.isTrue(Result.isOk(result));
    if (Result.isErr(result)) {
      throw new VError(result, "global.listAssignments failed");
    }
    const userAssignments = result;
    assert.isTrue(
      userAssignments.hiddenAssignments !== undefined &&
        userAssignments.hiddenAssignments.hasHiddenProjects === false &&
        userAssignments.projects !== undefined,
    );
  });

  it("A user can view user assignments of subprojects with view permissions", async () => {
    const result = await getUserAssignments(ctx, member.id, admin, orgaA, {
      ...baseRepository,
      getSubprojects: async () => {
        return [
          {
            ...baseSubproject[0],
            permissions: {
              "subproject.viewSummary": [admin.id],
              "subproject.viewDetails": [admin.id],
            },
          },
        ];
      },
    });

    assert.isTrue(Result.isOk(result));
    if (Result.isErr(result)) {
      throw new VError(result, "global.listAssignments failed");
    }
    const userAssignments = result;
    assert.isTrue(
      userAssignments.hiddenAssignments !== undefined &&
        userAssignments.hiddenAssignments.hasHiddenSubprojects === false &&
        userAssignments.subprojects !== undefined,
    );
  });

  it("A user can view user assignments of workflowitems with view permissions", async () => {
    const result = await getUserAssignments(ctx, member.id, admin, orgaA, {
      ...baseRepository,
      getWorkflowitems: async () => {
        return [
          {
            ...baseWorkflowitem[0],
            permissions: {
              "workflowitem.view": [admin.id],
            },
          },
        ];
      },
    });

    assert.isTrue(Result.isOk(result));
    if (Result.isErr(result)) {
      throw new VError(result, "global.listAssignments failed");
    }
    const userAssignments = result;
    assert.isTrue(
      userAssignments.hiddenAssignments !== undefined &&
        userAssignments.hiddenAssignments.hasHiddenWorkflowitems === false &&
        userAssignments.workflowitems !== undefined,
    );
  });
});
