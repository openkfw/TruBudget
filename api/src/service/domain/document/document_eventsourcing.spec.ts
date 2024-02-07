import { assert, expect } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import { StoredDocument } from "./document";
import { processDocumentEvents, sourceSecrets } from "./document_eventsourcing";

const alice: ServiceUser = {
  id: "alice",
  groups: ["alice_and_bob", "alice_and_bob_and_charlie"],
  address: "address",
};

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const uploadedDocument: StoredDocument = {
  id: "1",
  fileName: "dummyFile",
  organization: "dummyOrganization",
  organizationUrl: "dummyUrl",
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
  it("Document Uploaded: source documents from storage service", async () => {
    const result = processDocumentEvents(ctx, [uploadedDocumentEvent, storageServiceEvent]);
    assert.isTrue(Result.isOk(result));
    const { documents } = result;
    assert.isTrue(Result.isOk(documents));
    expect(documents[0]).to.eql(uploadedDocument);
  });

  it("Document Uploaded: empty organization returns errors", async () => {
    const result = processDocumentEvents(ctx, [
      { ...uploadedDocumentEvent, organization: "" },
      storageServiceEvent,
    ]);
    assert.isTrue(Result.isOk(result));
    const { documents, errors } = result;
    assert.isEmpty(documents);
    assert.isTrue(Result.isErr(errors[0]));
  });

  it("Document Uploaded: empty fileName returns errors", async () => {
    const result = processDocumentEvents(ctx, [
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
    const result = sourceSecrets(ctx, [secretPublishedEvent]);
    assert.isTrue(Result.isOk(result));
    const { secrets } = result;
    assert.isTrue(Result.isOk(secrets));
    expect(secrets[0]).to.eql(secretPublished);
  });

  it("Secret published: empty organization returns errors", async () => {
    const result = sourceSecrets(ctx, [{ ...secretPublishedEvent, organization: "" }]);
    assert.isTrue(Result.isOk(result));
    const { secrets, errors } = result;
    assert.isEmpty(secrets);
    assert.isTrue(Result.isErr(errors[0]));
  });
  it("Secret published: empty encrypted secret returns errors", async () => {
    const result = sourceSecrets(ctx, [{ ...secretPublishedEvent, encryptedSecret: "" }]);
    assert.isTrue(Result.isOk(result));
    const { secrets, errors } = result;
    assert.isEmpty(secrets);
    assert.isTrue(Result.isErr(errors[0]));
  });
});
