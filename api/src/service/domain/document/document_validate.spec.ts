import { assert } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { Project } from "../workflow/project";
import { Subproject } from "../workflow/subproject";
import { Workflowitem } from "../workflow/workflowitem";
import { StoredDocument } from "./document";
import { documentValidate } from "./document_validate";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};
const address = "address";

const alice: ServiceUser = {
  id: "alice",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address,
};
const bob: ServiceUser = {
  id: "bob",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address,
};
const charlie: ServiceUser = {
  id: "charlie",
  groups: ["alice_and_bob_and_charlie"],
  address,
};
const root: ServiceUser = { id: "root", groups: [], address };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy";

const baseProject: Project = {
  id: projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: alice.id,
  displayName: "dummy",
  description: "dummy",
  projectedBudgets: [],
  permissions: {},
  log: [],
  additionalData: {},
  tags: [],
};
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
const uploadedDocumentFileName = "1";

const storedDocuments: StoredDocument[] = [
  {
    id: uploadedDocumentId,
    hash: "hash1",
    fileName: uploadedDocumentFileName,
  },
];

const repository = {
  getWorkflowitem: () => Promise.resolve(baseWorkflowitem),
  getUsersForIdentity: async (identity) => {
    if (identity === "alice") return ["alice"];
    if (identity === "bob") return ["bob"];
    return Error(`unexpected identity: ${identity}`);
  },
  getDocumentsEvents: () => Promise.resolve([] as any),
  getAllProjects: () => Promise.resolve([]),
  getAllSubprojects: () => Promise.resolve([]),
  getAllWorkflowitems: () => Promise.resolve([]),
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
      {
        ...repository,
        getAllProjects: () => Promise.resolve([baseProject]),
        getAllSubprojects: () => Promise.resolve([baseSubproject]),
        getAllWorkflowitems: () =>
          Promise.resolve([{ ...baseWorkflowitem, documents: storedDocuments }]),
      },
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
