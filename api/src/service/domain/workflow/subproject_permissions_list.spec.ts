import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import { Subproject } from "./subproject";
import { getSubprojectPermissions } from "./subproject_permissions_list";

const ctx: Ctx = { requestId: "", source: "test" };
const bob: ServiceUser = { id: "bob", groups: [] };
const root: ServiceUser = { id: "root", groups: [] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const subprojectName = "dummy";

const permissions: Permissions = {
  "subproject.intent.listPermissions": ["bob"],
};

const baseSubproject: Subproject = {
  id: subprojectId,
  projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: subprojectName,
  description: subprojectName,
  assignee: bob.id,
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions,
  log: [],
  additionalData: {},
};

const repository = (returnedSubproject) => {
  return { getSubproject: async () => returnedSubproject };
};

describe("List subproject permissions: authorization", () => {
  it("With the 'subproject.intent.listPermissions' permission, the user can list project permissions", async () => {
    const result = await getSubprojectPermissions(
      ctx,
      bob,
      projectId,
      subprojectId,
      repository(baseSubproject),
    );

    assert.isTrue(Result.isOk(result));
    assert.equal(Result.unwrap(result), permissions);
  });

  it(
    "Without the 'subproject.intent.listPermissions' permission," +
      "the user cannot list subproject permissions",
    async () => {
      const subprojectWithoutPermissions: Subproject = { ...baseSubproject, permissions: {} };

      const result = await getSubprojectPermissions(
        ctx,
        bob,
        projectId,
        subprojectId,
        repository(subprojectWithoutPermissions),
      );
      assert.isTrue(Result.isErr(result));
      assert.instanceOf(result, NotAuthorized);
    },
  );

  it("The root user doesn't need permission to list project permissions", async () => {
    const result = await getSubprojectPermissions(
      ctx,
      root,
      projectId,
      subprojectId,
      repository(baseSubproject),
    );

    assert.isTrue(Result.isOk(result));
    assert.equal(Result.unwrap(result), permissions);
  });
});
describe("list subproject permissions: preconditions", () => {
  it("Listing a subproject's permissions fails if the subproject cannot be found", async () => {
    const result = await getSubprojectPermissions(ctx, bob, projectId, subprojectId, {
      getSubproject: async () => new Error("some error"),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});
