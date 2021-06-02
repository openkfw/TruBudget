import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "../workflow/subproject";
import { Workflowitem } from "../workflow/workflowitem";
import { documentValidate } from "./document_validate";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy";

const baseSubproject: Subproject = {
  id: subprojectId,
  projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: "alice",
  displayName: "dummy",
  description: "dummy",
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions: { "subproject.budget.updateProjected": [alice, bob, charlie].map((x) => x.id) },
  log: [],
  additionalData: {},
};

const baseWorkflowitem: Workflowitem = {
  isRedacted: false,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: alice.id,
  displayName: "dummy",
  description: "dummy",
  amountType: "N/A",
  documents: [],
  permissions: {},
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

describe("Validating uploaded document in workflowitem", () => {
  it("returns Error if documentId does not exist.", async () => {
    const isDocumentValid = true;
    const documentId = "";

    const newEventsResult = await documentValidate(
      isDocumentValid,
      documentId,
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      baseWorkflowitem.id,
      {
        getWorkflowitem: () => Promise.resolve(baseWorkflowitem),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          return Error(`unexpected identity: ${identity}`);
        },
      },
    );
    assert.isTrue(Result.isErr(newEventsResult));
  });
  it("creates workflowitem_document_validated event, if all the values are provided properly", async () => {
    const isDocumentValid = true;
    const documentId = "test";

    const newEventsResult = await documentValidate(
      isDocumentValid,
      documentId,
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      baseWorkflowitem.id,
      {
        getWorkflowitem: () => Promise.resolve(baseWorkflowitem),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          return Error(`unexpected identity: ${identity}`);
        },
      },
    );
    assert.isTrue(Result.isOk(newEventsResult));
  });
});
