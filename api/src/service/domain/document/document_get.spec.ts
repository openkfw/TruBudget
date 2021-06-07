import { assert, expect } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "../workflow/subproject";
import { Workflowitem } from "../workflow/workflowitem";
import { UploadedDocument } from "./document";
import {
  getAllDocuments,
  getAllDocumentsFromOffchainStorage,
  getOffchainDocument,
} from "./document_get";
import { uploadDocument } from "./document_upload";

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

const uploadedDocument: UploadedDocument = {
  id: "1",
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

const uploadEvent: BusinessEvent = {
  type: "document_uploaded",
  source: "",
  time: "", // ISO timestamp
  publisher: alice.id,
  docId: uploadedDocument.id,
  fileName: uploadedDocument.fileName,
  organization: "",
};

const t: BusinessEvent = {
  type: "storage_service_url_published",
  source: "",
  time: "", // ISO timestamp
  publisher: alice.id,
  organization: "string",
  organizationUrl: "string",
};

describe("Documents from offchain or external storage", () => {
  it("Offchain: All existing document can be fetched", async () => {
    const repository = {
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
      getDocumentsEvents: () => Promise.resolve([] as any),
    };
    const result = await getAllDocumentsFromOffchainStorage(ctx, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.not.equal(uploadDocument);
  });

  it("Offchain: An existing document can be fetched", async () => {
    const repository = {
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
      getDocumentsEvents: () => Promise.resolve([]),
    };

    const result = await getOffchainDocument(ctx, uploadedDocument.id, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.not.equal(uploadDocument);
  });

  it("Offchain: An non existing document can not be fetched", async () => {
    const repository = {
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
      getDocumentsEvents: () => Promise.resolve([]),
    };

    const result = await getOffchainDocument(ctx, "-1", repository);
    assert.isTrue(Result.isOk(result));
    expect(result).to.equal(undefined);
  });

  it("External storage: All existing documents can be fetched", async () => {
    const repository = {
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEvent]),
      getDocumentsEvents: () => Promise.resolve([]),
    };

    const result = await getAllDocuments(ctx, repository);
    assert.isTrue(Result.isOk(result));
    expect(result).to.not.equal(undefined);
  });
  it("External storage: An existing document can be fetched", async () => {
    const repository = {
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEvent]),
      getDocumentsEvents: () => Promise.resolve([]),
    };

    const result = await getOffchainDocument(ctx, uploadedDocument.id, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.not.equal(uploadDocument);
  });

  it("External storage: An non existing document can not be fetched", async () => {
    const repository = {
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEvent]),
      getDocumentsEvents: () => Promise.resolve([]),
    };

    const result = await getOffchainDocument(ctx, "-1", repository);
    assert.isTrue(Result.isOk(result));
    expect(result).to.equal(undefined);
  });

  it("Offchain and external storage: All existing documents can be fetched", async () => {
    const externalRepo = {
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEvent]),
      getDocumentsEvents: () => Promise.resolve([]),
    };
    const externalResult = await getAllDocuments(ctx, externalRepo);
    const offchainRepo = {
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEvent]),
      getDocumentsEvents: () => Promise.resolve([]),
    };
    const offchainResult = await getAllDocuments(ctx, offchainRepo);
    assert.isTrue(Result.isOk(externalResult) && Result.isOk(offchainResult));

    expect(externalResult).to.not.equal(undefined);
    expect(offchainResult).to.not.equal(undefined);
  });
});
