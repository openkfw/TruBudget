import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import { Subproject } from "./subproject";
import { getSubproject } from "./subproject_get";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: [] };
const subprojectId = "dummy-subproject";
const subprojectName = "dummy-Name";

const permissions: Permissions = {
    "subproject.viewSummary": ["alice"],
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

describe("get subproject: authorization", () => {
  it("Without the required permissions, a user cannot get a subproject.", async () => {
    const notPermittedSubroject: Subproject = {
   ...baseSubproject,
    permissions: {},
      };
    const result = await getSubproject(ctx, alice, subprojectId,
        {
        ...baseRepository,
        getSubproject: async () => notPermittedSubroject,
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("With the required permissions, a user can get all subproject.", async () => {
    const result = await getSubproject(ctx, alice, subprojectId, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).id, subprojectId);
  });

  it("The root user doesn't need permission to get a subproject.", async () => {
    const result = await getSubproject(ctx, alice, subprojectId, baseRepository);

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).id, subprojectId);
  });
});
describe("get subproject: preconditions", () => {
  it("Getting a subproject fails if the subproject cannot be found", async () => {
    const result = await getSubproject(ctx, alice, subprojectId,
      {
      ...baseRepository,
      getSubproject: async () => new Error("some error"),
  });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});
