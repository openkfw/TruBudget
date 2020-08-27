import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import { Project } from "./project";
import { Filter, getHistory } from "./project_history_get";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: [] };
const projectId = "dummy-project";
const projectName = "dummy-Name";

const filter: Filter = {
    publisher: alice.id,
    startAt: new Date().toISOString(),
    endAt: new Date().toISOString(),
    eventType: "project_created",
};

const permissions = {
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
};

describe("get project history: authorization", () => {
  it("Without the required permissions, a user cannot get a project's history.", async () => {
    const notPermittedProject = {
        ...baseProject,
        permissions: {},
      };
    const result = await getHistory(ctx, alice, projectId, filter,
        {
        ...baseRepository,
        getProject: async () => notPermittedProject,
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("With the required permissions, a user can get a project's history.", async () => {
    const result = await getHistory(ctx, alice, projectId, filter, baseRepository);
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("The root user doesn't need permission to get a project's history.", async () => {
    const result = await getHistory(ctx, alice, projectId, filter, baseRepository);
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});
