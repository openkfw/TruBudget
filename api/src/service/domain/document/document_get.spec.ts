import { assert, expect } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import { Project } from "../workflow/project";
import { Subproject } from "../workflow/subproject";
import { Workflowitem } from "../workflow/workflowitem";

import { DocumentOrExternalLinkReference, UploadedDocument } from "./document";
import { getAllDocumentInfos, getAllDocumentReferences, getDocumentInfo } from "./document_get";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = {
  id: "alice",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address: "address",
};

const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy";
const uploadedDocument: UploadedDocument = {
  id: "1",
  base64: "lakjflaksdjf",
  fileName: "dummyFile",
};

const uploadEvent: BusinessEvent = {
  type: "document_uploaded",
  source: "",
  time: "", // ISO timestamp
  publisher: alice.id,
  docId: uploadedDocument.id,
  fileName: uploadedDocument.fileName,
  organization: "organization",
};
const documentReference: DocumentOrExternalLinkReference[] = [
  {
    id: uploadEvent.docId,
    hash: "hash1",
    fileName: uploadedDocument.fileName,
  },
];

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
  permissions: {},
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
  documents: documentReference,
  permissions: { "workflowitem.list": ["alice"] },
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

const repository = {
  getDocumentsEvents: (): Promise<Result.Type<BusinessEvent[]>> => Promise.resolve([]),
  getAllProjects: (): Promise<Project[]> => Promise.resolve([]),
  getAllSubprojects: (): Promise<Subproject[]> => Promise.resolve([]),
  getAllWorkflowitems: (): Promise<Workflowitem[]> => Promise.resolve([]),
};

describe("Documents from storage service", () => {
  it("All existing documents can be fetched", async () => {
    const result = await getAllDocumentInfos(ctx, {
      ...repository,
      getDocumentsEvents: () => Promise.resolve([uploadEvent]),
    });
    assert.isTrue(Result.isOk(result));
    expect(result[0].fileName).to.eql(uploadEvent.fileName);
    expect(result[0].organization).to.eql(uploadEvent.organization);
  });

  it("An existing document can be fetched by ID", async () => {
    const result = await getDocumentInfo(ctx, uploadedDocument.id, {
      ...repository,
      getDocumentsEvents: () => Promise.resolve([uploadEvent]),
    });
    assert.isTrue(Result.isOk(result));
    if (Result.isOk(result)) {
      expect(result?.fileName).to.eql(uploadedDocument.fileName);
      expect(result?.id).to.eql(uploadedDocument.id);
    }
  });

  it("A non existing document can not be fetched", async () => {
    const result = await getDocumentInfo(ctx, "-1", {
      ...repository,
      getDocumentsEvents: () => Promise.resolve([uploadEvent]),
    });
    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(undefined);
  });

  it("All existing documents references can be fetched", async () => {
    const result = await getAllDocumentReferences({
      ...repository,
      getAllProjects: () => Promise.resolve([baseProject]),
      getAllSubprojects: () => Promise.resolve([baseSubproject]),
      getAllWorkflowitems: () => Promise.resolve([baseWorkflowitem]),
    });

    assert.isTrue(Result.isOk(result));
    expect(result[0].fileName).to.eql(uploadedDocument.fileName);
    expect(result[0].id).to.eql(uploadedDocument.id);
  });
});
