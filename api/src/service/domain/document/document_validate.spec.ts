import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "../workflow/subproject";
import { Workflowitem } from "../workflow/workflowitem";
import { UploadedDocument } from "./document";
import { documentValidate } from "./document_validate";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const root: ServiceUser = { id: "root", groups: [] };
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

const uploadedDocumentId = "1";

const uploadedDocument: UploadedDocument = {
  id: uploadedDocumentId,
  base64: "lakjflaksdjf",
  fileName: "dummyFile",
};

const uploadEventOffchain: BusinessEvent = {
  type: "workflowitem_document_uploaded",
  source: "",
  time: "", // ISO timestamp
  publisher: alice.id, //identity
  projectId: projectId,
  subprojectId: subprojectId,
  workflowitemId: workflowitemId,
  document: uploadedDocument,
};

const repository = {
  getWorkflowitem: () => Promise.resolve(baseWorkflowitem),
  getUsersForIdentity: async (identity) => {
    if (identity === "alice") return ["alice"];
    if (identity === "bob") return ["bob"];
    return Error(`unexpected identity: ${identity}`);
  },
  getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
  getDocumentsEvents: () => Promise.resolve([] as any),
};

describe("Validating uploaded document in workflowitem", () => {
  it("Validating works if the document exists", async () => {
    const isDocumentValid = true;
    const documentId = uploadedDocumentId;

    const newEventsResult = await documentValidate(
      isDocumentValid,
      documentId,
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      baseWorkflowitem.id,
      repository,
    );
    assert.isTrue(Result.isOk(newEventsResult));
  });

  it("Validating does not work if the document does not exists", async () => {
    const isDocumentValid = true;
    const documentId = "not_existing";

    const newEventsResult = await documentValidate(
      isDocumentValid,
      documentId,
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      baseWorkflowitem.id,
      repository,
    );
    assert.isTrue(Result.isErr(newEventsResult));
  });

  it("Root user cannot validate an existing document", async () => {
    const isDocumentValid = true;
    const documentId = uploadedDocumentId;

    const newEventsResult = await documentValidate(
      isDocumentValid,
      documentId,
      ctx,
      root,
      baseSubproject.projectId,
      baseSubproject.id,
      baseWorkflowitem.id,
      repository,
    );
    assert.isTrue(Result.isErr(newEventsResult));
  });
});
