import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import { Workflowitem } from "./workflowitem";
import { getAll } from "./workflowitem_permissions_list";

const ctx: Ctx = { requestId: "", source: "test" };
const bob: ServiceUser = { id: "bob", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const subprojectName = "dummy";
const workflowitemId = "dummy-workflowitem";

const permissions: Permissions = {
  "workflowitem.intent.listPermissions": ["bob"],
};

const baseWorkflowitem: Workflowitem = {
  isRedacted: false,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  status: "open",
  assignee: alice.id,
  displayName: "dummy",
  description: "dummy",
  amountType: "N/A",
  documents: [],
  permissions,
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

const baseRepository = {
  applyWorkflowitemType: () => [],
  getWorkflowitem: async () => baseWorkflowitem,
};

describe("List workflowitem permissions: authorization", () => {
  it(
    "With the 'workflowitem.intent.listPermissions' permission, " +
      "the user can list workflowitem permissions",
    async () => {
      const result = await getAll(
        ctx,
        bob,
        projectId,
        subprojectId,
        workflowitemId,
        baseRepository,
      );

      assert.isTrue(Result.isOk(result));
      assert.equal(Result.unwrap(result), permissions);
    },
  );

  it(
    "Without the 'workflowitem.intent.listPermissions' permission," +
      "the user cannot list workflowitem permissions",
    async () => {
      const result = await getAll(ctx, bob, projectId, subprojectId, workflowitemId, {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          permissions: {},
        }),
      });

      assert.isTrue(Result.isErr(result));
      assert.instanceOf(result, NotAuthorized);
    },
  );
  it("The root user doesn't need permission to list workflowitem permissions", async () => {
    const result = await getAll(ctx, bob, projectId, subprojectId, workflowitemId, baseRepository);

    assert.isTrue(Result.isOk(result));
    assert.equal(Result.unwrap(result), permissions);
  });
});
describe("list workflowitem permissions: preconditions", () => {
  it("Listing a workflowitem's permissions fails if the workflowitem cannot be found", async () => {
    const result = await getAll(ctx, bob, projectId, subprojectId, workflowitemId, {
      ...baseRepository,
      getWorkflowitem: async (_workflowitemId) => new Error("some error"),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});
