import { assert, expect } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";

import { UploadedDocument } from "./document";
import {
  getAllDocumentInfos,
  getAllDocuments,
  getAllDocumentsFromOffchainStorage,
  getDocumentInfo,
  getOffchainDocument,
} from "./document_get";

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
  organization: "organization",
};

const repository = {
  getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
  getDocumentsEvents: () => Promise.resolve([]),
};

describe("Documents from offchain or external storage", () => {
  it("Offchain: All existing documents can be fetched", async () => {
    const result = await getAllDocumentsFromOffchainStorage(ctx, {
      ...repository,
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
    });
    assert.isTrue(Result.isOk(result));
    // eql() checks if the content is equal (NOT the reference)
    expect(result[0]).to.eql(uploadedDocument);
  });

  it("Offchain: An existing document can be fetched", async () => {
    const result = await getOffchainDocument(ctx, uploadedDocument.id, {
      ...repository,
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
    });
    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(uploadedDocument);
  });

  it("Offchain: A non existing document can not be fetched", async () => {
    const result = await getOffchainDocument(ctx, "-1", {
      ...repository,
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
    });
    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(undefined);
  });

  it("External storage: All existing documents can be fetched", async () => {
    const result = await getAllDocumentInfos(ctx, {
      ...repository,
      getDocumentsEvents: () => Promise.resolve([uploadEvent]),
    });
    assert.isTrue(Result.isOk(result));
    expect(result[0].fileName).to.eql(uploadEvent.fileName);
    expect(result[0].organization).to.eql(uploadEvent.organization);
  });

  it("External storage: An existing document can be fetched by ID", async () => {
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

  it("External storage: A non existing document can not be fetched", async () => {
    const result = await getDocumentInfo(ctx, "-1", {
      ...repository,
      getDocumentsEvents: () => Promise.resolve([uploadEvent]),
    });
    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(undefined);
  });

  it("Offchain and external storage: All existing documents can be fetched", async () => {
    const repository = {
      getDocumentsEvents: () => Promise.resolve([uploadEvent]),
      getOffchainDocumentsEvents: () => Promise.resolve([uploadEventOffchain]),
    };
    const result = await getAllDocuments(ctx, repository);

    assert.isTrue(Result.isOk(result));
    expect(result[0].fileName).to.eql(uploadEvent.fileName);
    expect(result[0].organization).to.eql(uploadEvent.organization);
    expect(result[1]).to.eql(uploadEventOffchain.document);
  });
});
