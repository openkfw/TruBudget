import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "./subproject";
import { Filter, getHistory } from "./subproject_history_get";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: [] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const subprojectName = "dummy-Name";

const filter: Filter = {
    publisher: alice.id,
    startAt: new Date().toISOString(),
    endAt: new Date().toISOString(),
    eventType: "subproject_created",
};

const permissions = {
    "subproject.viewDetails": ["alice"],
  };

const baseSubproject: Subproject = {
    id: subprojectId,
    projectId: subprojectId,
    createdAt: new Date().toISOString(),
    status: "open",
    displayName: subprojectName,
    description: subprojectName,
    assignee: alice.id,
    currency: "EUR",
    projectedBudgets: [],
    permissions,
    log: [],
    workflowitemOrdering: [],
    additionalData: {},
  };

const baseRepository = {
    getSubproject: async () => baseSubproject,
};

describe("get subproject history: authorization", () => {
  it("Without the required permissions, a user cannot get a subproject's history.", async () => {
    const notPermittedSubproject = {
        ...baseSubproject,
        permissions: {},
      };
    const result = await getHistory(ctx, alice, projectId, subprojectId, filter,
        {
        ...baseRepository,
        getSubproject: async () => notPermittedSubproject,
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("With the required permissions, a user can get a subproject's history.", async () => {
    const result = await getHistory(ctx, alice, projectId, subprojectId, filter, baseRepository);
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("The root user doesn't need permission to get a subproject's history.", async () => {
    const result = await getHistory(ctx, alice, projectId, subprojectId, filter, baseRepository);
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});
