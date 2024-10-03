import { assert } from "chai";
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as Project from "../workflow/project";
import * as Subproject from "../workflow/subproject";
import * as Workflowitem from "../workflow/workflowitem";

import { getUserAssignments } from "./user_assignments_get";

const ctx: Ctx = { requestId: "", source: "test" };
const address = "address";
const root: ServiceUser = { id: "root", groups: [], address };
const admin: ServiceUser = { id: "admin", groups: [], address };
const member: ServiceUser = { id: "member", groups: [], address };
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
  getAllProjects: async (): Promise<Project.Project[]> => baseProject,
  getSubprojects: async (): Promise<Subproject.Subproject[]> => baseSubproject,
  getWorkflowitems: async (): Promise<Workflowitem.Workflowitem[]> => baseWorkflowitem,
  getUser: async (): Promise<UserRecord.UserRecord> => baseUser,
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
              "project.list": [admin.id],
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
              "subproject.list": [admin.id],
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
              "workflowitem.list": [admin.id],
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
