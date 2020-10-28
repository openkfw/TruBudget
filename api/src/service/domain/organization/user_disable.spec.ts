import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { disableUser, RequestData } from "./user_disable";
import { UserRecord } from "./user_record";
import * as GlobalPermissions from "../workflow/global_permissions";
import * as UserAssignments from "../workflow/user_assignments";
import * as Project from "../workflow/project";
import * as Subproject from "../workflow/subproject";
import * as Workflowitem from "../workflow/workflowitem";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const admin: ServiceUser = { id: "admin", groups: [] };
const member: ServiceUser = { id: "member", groups: [] };
const orgaA = "orgaA";
const otherOrganization = "otherOrganization";

const basePermissions: GlobalPermissions.GlobalPermissions = {
  permissions: { "global.disableUser": ["admin"] },
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

const baseProject: Project.Project = {
  assignee: "baseUser",
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
};

const baseSubproject: Subproject.Subproject = {
  assignee: "baseUser",
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
};

const baseWorkflowitem: Workflowitem.Workflowitem = {
  assignee: "baseUser",
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
};

const baseUserAssignments: UserAssignments.UserAssignments = { userId: "baseUser" };

const baseRepository = {
  getGlobalPermissions: async () => basePermissions,
  getUser: async () => baseUser,
  getUserAssignments: async () => baseUserAssignments,
};

describe("Disable users: permissions", () => {
  it("Without the global.disableUser permission, a user cannot disable users", async () => {
    const result = await disableUser(ctx, member, orgaA, requestData, {
      ...baseRepository,
    });

    // NotAuthorized error due to the missing permissions:
    assert.isTrue(Result.isErr(result), "Charlie is not authorized to disable users");
    assert.instanceOf(result, NotAuthorized, "The error is of the type 'Not Authorized'");
  });

  it("The root user doesn't need permission to disable users", async () => {
    const result = await disableUser(ctx, root, orgaA, requestData, {
      ...baseRepository,
    });
    assert.isTrue(Result.isOk(result));
  });

  it("A user cannot disable himself", async () => {
    const result = await disableUser(ctx, admin, orgaA, requestData, {
      ...baseRepository,
      getUser: async () => {
        return { ...baseUser, userId: admin.id };
      },
    });
    assert.isTrue(Result.isErr(result));
  });

  it("A user can disable users if the correct permissions are given", async () => {
    const result = await disableUser(ctx, admin, orgaA, requestData, {
      ...baseRepository,
    });
    if (Result.isErr(result)) {
      throw result;
    }
    assert.isTrue(Result.isOk(result));
    assert.isTrue(result.length > 0);
  });

  it("Root user cannot disable users from other organizations", async () => {
    const result = await disableUser(ctx, root, otherOrganization, requestData, {
      ...baseRepository,
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized, "The error is of the type 'Not Authorized'");
  });

  it("A user cannot disable users from other organizations", async () => {
    const result = await disableUser(ctx, admin, otherOrganization, requestData, {
      ...baseRepository,
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized, "The error is of the type 'Not Authorized'");
  });
});

describe("Disable users: Check Assigments", () => {
  it("If the user is assigned to a project, the user cannot be disabled", async () => {
    const assignedProject = { ...baseProject, assignee: requestData.userId };
    const result = await disableUser(ctx, admin, orgaA, requestData, {
      ...baseRepository,
      getUserAssignments: async () => {
        return { ...baseUserAssignments, projects: [assignedProject] };
      },
    });

    // PreconditionError because baseUser is assigned for project:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });

  it("If the user is not assigned to any project/subproject/workflowitem, the user can be disabled", async () => {
    const result = await disableUser(ctx, admin, orgaA, requestData, {
      ...baseRepository,
      getUserAssignments: async () => {
        return { ...baseUserAssignments };
      },
    });
    if (Result.isErr(result)) {
      throw result;
    }
    assert.isTrue(Result.isOk(result));
    assert.isTrue(result.length > 0);
  });

  it("If the user is assigned to a subproject, the user cannot be disabled", async () => {
    const assignedSubproject = { ...baseSubproject, assignee: requestData.userId };
    const result = await disableUser(ctx, admin, orgaA, requestData, {
      ...baseRepository,
      getUserAssignments: async () => {
        return { ...baseUserAssignments, subprojects: [assignedSubproject] };
      },
    });

    // PreconditionError because baseUser is assigned for subproject:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });

  it("If the user is assigned to a workflowitem, the user cannot be disabled", async () => {
    const assignedWorkflowitem = { ...baseWorkflowitem, assignee: requestData.userId };
    const result = await disableUser(ctx, admin, orgaA, requestData, {
      ...baseRepository,
      getUserAssignments: async () => {
        return { ...baseUserAssignments, workflowitems: [assignedWorkflowitem] };
      },
    });

    // PreconditionError because baseUser is assigned for workflowitem:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });
});
