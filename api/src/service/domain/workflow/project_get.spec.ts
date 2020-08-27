import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import { Project } from "./project";
import { getProject } from "./project_get";

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

const baseRepository = {
    getProject: async () => baseProject,
    getUsersForIdentity: async (identity: string) => {
    if (identity === "alice") return ["alice"];
    if (identity === "root") return ["root"];
    throw Error(`unexpected identity: ${identity}`);
  },
};

describe("get project: authorization", () => {
  it("Without the required permissions, a user cannot get a project.", async () => {
    const notPermittedProject = {
        ...baseProject,
        permissions: {},
      };
    const result = await getProject(ctx, alice, projectId,
        {
        ...baseRepository,
        getProject: async () => notPermittedProject,
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("With the required permissions, a user can get a project.", async () => {
    const result = await getProject(ctx, alice, projectId, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).id, projectId);
  });

  it("The root user doesn't need permission to get a project.", async () => {
    const result = await getProject(ctx, root, projectId, baseRepository);

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).id, projectId);
  });
});
