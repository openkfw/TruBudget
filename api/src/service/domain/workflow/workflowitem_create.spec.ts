import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "./subproject";
import * as WorkflowitemCreate from "./workflowitem_create";

const baseSubproject: Subproject = {
  id: "dummy-subproject",
  projectId: "test",
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: "test",
  description: "test",
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions: {},
  log: [],
  additionalData: {},
};

const ctx: Ctx = { requestId: "", source: "test" };
const user: ServiceUser = { id: "root", groups: [] };

describe("Create workflowitem", () => {
  it("Root cannot create a workflow item", async () => {
    const data: WorkflowitemCreate.RequestData = {
      projectId: "test",
      subprojectId: "dummy-subproject",
      displayName: "test",
      amountType: "N/A",
      workflowitemType: "general",
    };

    const result = await WorkflowitemCreate.createWorkflowitem(ctx, user, data, {
      workflowitemExists: async (_projectId, _subprojectId, _workflowitemId) => false,
      getSubproject: async () => baseSubproject,
      applyWorkflowitemType: () => [],
    });

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(Result.unwrap_err(result), PreconditionError);
  });
});
