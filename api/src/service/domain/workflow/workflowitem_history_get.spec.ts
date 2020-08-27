import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import { Workflowitem } from "./workflowitem";
import { Filter, getHistory } from "./workflowitem_history_get";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: [] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy-workflowitem";

const filter: Filter = {
    publisher: alice.id,
    startAt: new Date().toISOString(),
    endAt: new Date().toISOString(),
    eventType: "subproject_created",
};

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
    getWorkflowitem: async () => baseWorkflowitem,
};

describe("get worklfowitem history: authorization", () => {
  it("Without the required permissions, a user cannot get a worklfowitem's history.", async () => {
    const notPermittedWorkflowitem = {
        ...baseWorkflowitem,
        permissions: {},
      };
    const result = await getHistory(ctx, alice, projectId, subprojectId, workflowitemId, filter,
        {
        ...baseRepository,
        getWorkflowitem: async () => notPermittedWorkflowitem,
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("With the required permissions, a user can get a worklfowitem's history.", async () => {
    const result = await getHistory(ctx, alice, projectId, subprojectId, workflowitemId, filter, baseRepository);
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("The root user doesn't need permission to get a worklfowitem's history.", async () => {
    const result = await getHistory(ctx, root, projectId, subprojectId, workflowitemId, filter, baseRepository);
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});
