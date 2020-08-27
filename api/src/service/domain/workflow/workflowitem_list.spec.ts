import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { Workflowitem } from "./workflowitem";
import { getAllVisible } from "./workflowitem_list";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: [] };
const subprojectId = "dummy-subproject";
const projectId = "dummy-project";
const workflowitemId = "dummy-workflowitem";

const permissions = {
    "workflowitem.view": ["alice"],
  };

const baseWorkflowitem: Workflowitem = {
  isRedacted: false,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  status: "open",
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
    getWorkflowitems: async () => [baseWorkflowitem],
    getWorkflowitemOrdering: async () => [],
  };

describe("list workflowitems: authorization", () => {
  it("Without the required permissions, a user cannot list all workflowitems.", async () => {
    const notPermittedWorkflowitem = {
        ...baseWorkflowitem,
        permissions: {},
      };
    const result = await getAllVisible(ctx, alice, projectId, subprojectId,
        {
        ...baseRepository,
        getWorkflowitems: async () => [notPermittedWorkflowitem],
    });

    // No errors, but workflowitems should be redacted:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    Result.unwrap(result).forEach(r => assert.equal(r.isRedacted, true));

  });
  it("With the required permissions, a user can list all workflowitems.", async () => {
    const result = await getAllVisible(ctx, alice, projectId, subprojectId, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(result[0].id, workflowitemId);

  });

  it("The root user doesn't need permission to list all workflowitems.", async () => {
    const result = await getAllVisible(ctx, root, projectId, subprojectId, baseRepository);

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(result[0].id, workflowitemId);
  });
});
