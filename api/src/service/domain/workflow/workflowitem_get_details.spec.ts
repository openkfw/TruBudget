import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { DocumentOrExternalLinkReference, UploadedDocument } from "../document/document";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";

import { Workflowitem } from "./workflowitem";
import { getWorkflowitemDetails } from "./workflowitem_get_details";

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

const documentStoredInWorkflowitem: DocumentOrExternalLinkReference = {
  id: "documentId",
  hash: "lakjflaksdjf",
  fileName: "file",
};
const uploadedDocument: UploadedDocument = {
  id: "documentIdStorage",
  base64: "lakjflaksdjf",
  fileName: "storageFile",
};

const baseRepository = {
  getWorkflowitem: async (): Promise<Workflowitem> => baseWorkflowitem,
  downloadDocument: async (docId: string): Promise<UploadedDocument> => uploadedDocument,
};

describe("get workflowitems: authorization", () => {
  it("Without the required permissions, a user cannot get a workflowitem's details.", async () => {
    const notPermittedWorkflowitem: Workflowitem = {
      ...baseWorkflowitem,
      permissions: {},
    };
    const result = await getWorkflowitemDetails(ctx, alice, workflowitemId, {
      ...baseRepository,
      getWorkflowitem: async () => notPermittedWorkflowitem,
    });

    assert.instanceOf(result, NotAuthorized);
  });

  it("With the required permissions, a user can get the workflowitem details.", async () => {
    const result = await getWorkflowitemDetails(ctx, alice, workflowitemId, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).id, workflowitemId);
  });

  it("The root user doesn't need permission to get the workflowitem details.", async () => {
    const result = await getWorkflowitemDetails(ctx, root, workflowitemId, baseRepository);

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.equal(Result.unwrap(result).id, workflowitemId);
  });
});
describe("get workflowitem details: preconditions", () => {
  it("Getting a workflowitem fails if the workflowitem cannot be found", async () => {
    const result = await getWorkflowitemDetails(ctx, alice, workflowitemId, {
      ...baseRepository,
      getWorkflowitem: async () => new Error("some error"),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});
describe("get workflowitem details: test correct availability", () => {
  it("Unavailable documents are marked as unavailable", async () => {
    const workflowitemWithDocs: Workflowitem = {
      ...baseWorkflowitem,
      documents: [documentStoredInWorkflowitem],
    };
    const result = await getWorkflowitemDetails(ctx, alice, workflowitemId, {
      getWorkflowitem: async () => workflowitemWithDocs,
      downloadDocument: async () => new Error("some error"),
    });
    assert.isTrue(Result.isOk(result));
    const documents = Result.unwrap(result).documents;
    assert.isNotEmpty(documents);
    assert.isFalse(documents[0].available);
  });
  it("Available documents are marked as available", async () => {
    const workflowitemWithDocs: Workflowitem = {
      ...baseWorkflowitem,
      documents: [documentStoredInWorkflowitem],
    };
    const result = await getWorkflowitemDetails(ctx, alice, workflowitemId, {
      getWorkflowitem: async () => workflowitemWithDocs,
      downloadDocument: async () => uploadedDocument,
    });
    assert.isTrue(Result.isOk(result));
    const documents = Result.unwrap(result).documents;
    assert.isNotEmpty(documents);
    assert.isTrue(documents[0].available);
  });
});
