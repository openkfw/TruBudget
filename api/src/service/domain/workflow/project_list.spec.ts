import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { Project } from "./project";
import { getAllVisible } from "./project_list";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: [] };
const projectId = "dummy-project";
const projectName = "dummy-Name";

const permissions = {
  "project.viewSummary": ["alice"],
  "project.viewDetails": ["alice"],
};

const baseProject: Project = {
  id: projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: projectName,
  description: projectName,
  assignee: alice.id,
  projectedBudgets: [],
  permissions,
  log: [],
  tags: [],
  additionalData: {},
};
const notPermittedProject: Project = {
  ...baseProject,
  permissions: {},
};
const baseRepository = {
  getAllProjects: async () => [baseProject],
  getUsersForIdentity: async (identity: string) => {
    if (identity === "alice") return ["alice"];
    if (identity === "root") return ["root"];
    throw Error(`unexpected identity: ${identity}`);
  },
};

describe("list projects: authorization", () => {
  it("Without the required permissions, a user cannot list all projects.", async () => {
    const result = await getAllVisible(ctx, alice, {
      ...baseRepository,
      getAllProjects: async () => [notPermittedProject],
    });

    // No errors, but no projects visible:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.isEmpty(result);
  });
  it("With the required permissions, a user can list all projects.", async () => {
    const result = await getAllVisible(ctx, alice, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(result[0].id, projectId);
  });
  it("A user can only list the projects they have permission to view.", async () => {
    const result = await getAllVisible(ctx, alice, {
      ...baseRepository,
      getAllProjects: async () => [baseProject, notPermittedProject],
    });
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).length, 1);
  });

  it("The root user doesn't need permission to list all projects.", async () => {
    const result = await getAllVisible(ctx, root, baseRepository);

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(result[0].id, projectId);
  });
});
