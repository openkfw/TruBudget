import { assert } from "chai";

import { Workflowitem } from "../../../httpd";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";

import { Subproject } from "./subproject";
import { getAllVisible } from "./subproject_list";

const ctx: Ctx = { requestId: "", source: "test" };
const address = "address";
const root: ServiceUser = { id: "root", groups: [], address };
const alice: ServiceUser = { id: "alice", groups: [], address };
const subprojectId = "dummy-subproject";
const subprojectName = "dummy-Name";

const permissions: Permissions = {
  "subproject.list": ["alice"],
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
  getAllSubprojects: async (): Promise<Subproject[]> => [baseSubproject],
  getWorkflowitems: async (): Promise<Workflowitem[]> => [],
  getUsersForIdentity: async (identity: string): Promise<string[]> => {
    if (identity === "alice") return ["alice"];
    if (identity === "root") return ["root"];
    throw Error(`unexpected identity: ${identity}`);
  },
};

describe("list subprojects: authorization", () => {
  it("Without the required permissions, a user cannot list all subprojects.", async () => {
    const notPermittedSubroject: Subproject = {
      ...baseSubproject,
      permissions: {},
    };
    const result = await getAllVisible(ctx, alice, {
      ...baseRepository,
      getAllSubprojects: async () => [notPermittedSubroject],
    });

    // No errors, but no subprojects visible:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.isEmpty(result);
  });
  it("With the required permissions, a user can list all subprojects.", async () => {
    const result = await getAllVisible(ctx, alice, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(result[0].id, subprojectId);
  });
  it("A user can only list the subprojects they have permission to view.", async () => {
    const notPermittedSubproject: Subproject = {
      ...baseSubproject,
      permissions: {},
    };
    const result = await getAllVisible(ctx, alice, {
      ...baseRepository,
      getAllSubprojects: async () => [baseSubproject, notPermittedSubproject],
    });
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).length, 1);
  });

  it("The root user doesn't need permission to list all subprojects.", async () => {
    const result = await getAllVisible(ctx, root, baseRepository);

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(result[0].id, subprojectId);
  });
});
