import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";

import { Workflowitem } from "./workflowitem";
import { getWorkflowitem } from "./workflowitem_get";

const ctx: Ctx = { requestId: "", source: "test" };
const address = "address";
const root: ServiceUser = { id: "root", groups: [], address };
const alice: ServiceUser = { id: "alice", groups: [], address };
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy-workflowitem";

const permissions: Permissions = {
  "workflowitem.list": ["alice"],
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
  getWorkflowitem: async (): Promise<Workflowitem> => baseWorkflowitem,
};

describe("get workflowitems: authorization", () => {
  it("Without the required permissions, a user cannot get a workflowitem.", async () => {
    const notPermittedWorkflowitem: Workflowitem = {
      ...baseWorkflowitem,
      permissions: {},
    };
    const result = await getWorkflowitem(ctx, alice, workflowitemId, {
      ...baseRepository,
      getWorkflowitem: async () => notPermittedWorkflowitem,
    });

    assert.instanceOf(result, NotAuthorized);
  });

  it("With the required permissions, a user can get a workflowitem.", async () => {
    const result = await getWorkflowitem(ctx, alice, workflowitemId, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).id, workflowitemId);
  });

  it("The root user doesn't need permission to get a workflowitem.", async () => {
    const result = await getWorkflowitem(ctx, root, workflowitemId, baseRepository);

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).id, workflowitemId);
  });
});
describe("get workflowitem: preconditions", () => {
  it("Getting a workflowitem fails if the workflowitem cannot be found", async () => {
    const result = await getWorkflowitem(ctx, alice, workflowitemId, {
      ...baseRepository,
      getWorkflowitem: async () => new Error("some error"),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});
