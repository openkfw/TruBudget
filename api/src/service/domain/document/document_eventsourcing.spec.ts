import { assert, expect } from "chai";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import { UploadedDocument } from "./document";
import { sourceDocuments, sourceOffchainDocuments, sourceSecrets } from "./document_eventsourcing";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import * as DocumentUploaded from "./document_uploaded";

const alice: ServiceUser = {
  id: "alice",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address: "address",
};
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const offchainDocument: UploadedDocument = {
  id: "1",
  base64: "lakjflaksdjf",
  fileName: "dummyFile",
};

const uploadedDocument: DocumentUploaded.Document = {
  id: "1",
  fileName: "dummyFile",
  organization: "dummyOrganization",
  organizationUrl: "dummyUrl",
};

const offchainDocumentEvent: BusinessEvent = {
  type: "workflowitem_document_uploaded",
  source: "",
  time: "", // ISO timestamp
  publisher: alice.id, //identity
  projectId: projectId,
  subprojectId: subprojectId,
  workflowitemId: workflowitemId,
  document: offchainDocument,
};

const uploadedDocumentEvent: BusinessEvent = {
  type: "document_uploaded",
  source: "",
  time: "", // ISO timestamp
  publisher: alice.id,
  docId: uploadedDocument.id,
  fileName: uploadedDocument.fileName,
  organization: uploadedDocument.organization,
};

const storageServiceEvent: BusinessEvent = {
  type: "storage_service_url_published",
  source: "",
  time: "", // ISO timestamp
  publisher: alice.id,
  organization: uploadedDocument.organization,
  organizationUrl: uploadedDocument.organizationUrl,
};

const secretPublished = {
  docId: "1",
  organization: "dummyOrganization",
  encryptedSecret: "dummySecret",
};
const secretPublishedEvent: BusinessEvent = {
  type: "secret_published",
  source: "",
  time: "",
  publisher: "",
  docId: secretPublished.docId,
  organization: secretPublished.organization,
  encryptedSecret: secretPublished.encryptedSecret,
};

describe("Document eventsourcing", () => {
  it("Workflowitem Document Uploaded: source documents stored offchain", async () => {
    const result = await sourceOffchainDocuments(ctx, [offchainDocumentEvent]);
    assert.isTrue(Result.isOk(result));
    const { documents } = result;
    assert.isTrue(Result.isOk(documents));
    expect(documents[0]).to.eql(offchainDocument);
  });

  it("Document Uploaded: source documents from storage service", async () => {
    const result = await sourceDocuments(ctx, [uploadedDocumentEvent, storageServiceEvent]);
    assert.isTrue(Result.isOk(result));
    const { documents } = result;
    assert.isTrue(Result.isOk(documents));
    expect(documents[0]).to.eql(uploadedDocument);
  });

  it("Document Uploaded: empty organization returns errors", async () => {
    const result = await sourceDocuments(ctx, [
      { ...uploadedDocumentEvent, organization: "" },
      storageServiceEvent,
    ]);
    assert.isTrue(Result.isOk(result));
    const { documents, errors } = result;
    assert.isEmpty(documents);
    assert.isTrue(Result.isErr(errors[0]));
  });

  it("Document Uploaded: empty fileName returns errors", async () => {
    const result = await sourceDocuments(ctx, [
      { ...uploadedDocumentEvent, fileName: "" },
      storageServiceEvent,
    ]);
    assert.isTrue(Result.isOk(result));
    const { documents, errors } = result;
    assert.isEmpty(documents);
    assert.isTrue(Result.isErr(errors[0]));
  });
});

describe("Secret eventsourcing", () => {
  it("Secret published: source secret from event", async () => {
    const result = await sourceSecrets(ctx, [secretPublishedEvent]);
    assert.isTrue(Result.isOk(result));
    const { secrets } = result;
    assert.isTrue(Result.isOk(secrets));
    expect(secrets[0]).to.eql(secretPublished);
  });

  it("Secret published: empty organization returns errors", async () => {
    const result = await sourceSecrets(ctx, [{ ...secretPublishedEvent, organization: "" }]);
    assert.isTrue(Result.isOk(result));
    const { secrets, errors } = result;
    assert.isEmpty(secrets);
    assert.isTrue(Result.isErr(errors[0]));
  });
  it("Secret published: empty encrypted secret returns errors", async () => {
    const result = await sourceSecrets(ctx, [{ ...secretPublishedEvent, encryptedSecret: "" }]);
    assert.isTrue(Result.isOk(result));
    const { secrets, errors } = result;
    assert.isEmpty(secrets);
    assert.isTrue(Result.isErr(errors[0]));
  });
});
