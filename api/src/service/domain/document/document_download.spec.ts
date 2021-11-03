import { assert, expect } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { Workflowitem } from "../workflow/workflowitem";
import { StoredDocument, UploadedDocument } from "./document";
import * as DocumentUploaded from "./document_uploaded";
import * as DocumentShared from "./document_shared";
import { getDocument } from "./workflowitem_document_download";
import VError from "verror";

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

const subprojectId = "dummy-subproject";
const workflowitemId = "dummy-workflowitem";

const documentIdOffchain = "1";
const documentIdStorage = "2";
const documentIdExternalStorage = "3";
const hash = "hash";

const uploadedOffChainDocument: UploadedDocument = {
  id: documentIdOffchain,
  base64: "lakjflaksdjf",
  fileName: "offchainFile",
};
const uploadedStorageDocument: UploadedDocument = {
  id: documentIdStorage,
  base64: "lakjflaksdjf",
  fileName: "storageFile",
};
const uploadedExternalStorageDocument: UploadedDocument = {
  id: documentIdExternalStorage,
  base64: "lakjflaksdjf",
  fileName: "externalStorageFile",
};

const documentInfoStorage: DocumentUploaded.Document = {
  id: documentIdStorage,
  fileName: uploadedStorageDocument.fileName,
  organization: "organization",
  organizationUrl: "",
};
const documentInfoExternalStorage: DocumentUploaded.Document = {
  id: documentIdExternalStorage,
  fileName: uploadedExternalStorageDocument.fileName,
  organization: "organization",
  organizationUrl: "organizationUrl",
};

const storedDocuments: StoredDocument[] = [
  {
    id: "guid1",
    hash,
  },
  {
    id: documentIdStorage,
    hash,
    fileName: uploadedStorageDocument.fileName,
    organization: "organization",
  },
  {
    id: "guid3",
    hash,
    fileName: uploadedExternalStorageDocument.fileName,
    organization: "organization",
    organizationUrl: "organizationUrl",
  },
  {
    id: documentIdOffchain,
    hash,
    fileName: uploadedOffChainDocument.fileName,
  },
  {
    id: documentIdExternalStorage,
    hash,
    fileName: uploadedExternalStorageDocument.fileName,
  },
];

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
  documents: storedDocuments,
  permissions: { "workflowitem.view": ["alice"] },
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

const secretPublished: DocumentShared.SecretPublished = {
  docId: "override",
  organization: "organization",
  encryptedSecret: "encryptedSecret",
};

const decryptedSecret: string = "decryptedSecret";
const privateKey: string = "privateKey";

const repository = {
  getWorkflowitem: () => Promise.resolve(baseWorkflowitem),
  getOffchainDocument: (docId) => {
    return Promise.resolve(undefined);
  },
  getDocumentFromStorage: (id, secret) => {
    throw new VError();
  },
  getDocumentFromExternalStorage: (id, secret, storageServiceUrl) => {
    throw new VError();
  },
  getDocumentInfo: (docId) => {
    return Promise.resolve(undefined);
  },
  getSecret: (docId, organization) => Promise.resolve({ ...secretPublished, docId }),
  decryptWithKey: () => Promise.resolve(decryptedSecret),
  getPrivateKey: (organization) => Promise.resolve(privateKey),
};

// These tests will work even if the Storage-Service is not enabled.
// Thats because the data from the storage servive (internal and external)
// are injected by the getDocumentInfo() method.
// Enabling the storage service in tests is not possible, since it is enabled by
// env variables in config.ts

describe("Download documents attached to a workflowitem", () => {
  it("Offchain: Downloading existing documents works", async () => {
    const result = await getDocument(ctx, alice, workflowitemId, documentIdOffchain, {
      ...repository,
      getOffchainDocument: () => Promise.resolve(uploadedOffChainDocument),
      getDocumentInfo: () => Promise.resolve(undefined),
    });

    assert.isTrue(Result.isOk(result));
    expect(result).to.include({ fileName: "offchainFile" });
  });

  it("Internal Storage: Downloading existing documents works", async () => {
    const result = await getDocument(ctx, alice, workflowitemId, documentIdStorage, {
      ...repository,
      getOffchainDocument: () => Promise.resolve(undefined),
      getDocumentFromStorage: () => Promise.resolve(uploadedStorageDocument),
      getDocumentFromExternalStorage: () => Promise.resolve(uploadedExternalStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoStorage),
    });

    assert.isTrue(Result.isOk(result));
    expect(result).to.include({ fileName: "storageFile" });
  });

  it("External Storage: Downloading existing documents works", async () => {
    const result = await getDocument(ctx, alice, workflowitemId, documentIdExternalStorage, {
      ...repository,
      getOffchainDocument: () => Promise.resolve(undefined),
      getDocumentFromExternalStorage: () => Promise.resolve(uploadedExternalStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoExternalStorage),
    });
    assert.isTrue(Result.isOk(result));
    expect(result).to.include({ fileName: "externalStorageFile" });
  });

  it("Downloading existing documents does not work without workflowitem.view permission", async () => {
    const offchainResult = await getDocument(ctx, bob, workflowitemId, documentIdOffchain, {
      ...repository,
      getOffchainDocument: () => Promise.resolve(uploadedOffChainDocument),
      getDocumentInfo: () => Promise.resolve(undefined),
    });
    const storageResult = await getDocument(ctx, bob, workflowitemId, documentIdStorage, {
      ...repository,
      getOffchainDocument: () => Promise.resolve(undefined),
      getDocumentFromStorage: () => Promise.resolve(uploadedStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoStorage),
    });
    const externalStorageResult = await getDocument(
      ctx,
      bob,
      workflowitemId,
      documentIdExternalStorage,
      {
        ...repository,
        getOffchainDocument: () => Promise.resolve(undefined),
        getDocumentFromExternalStorage: () => Promise.resolve(uploadedExternalStorageDocument),
        getDocumentInfo: () => Promise.resolve(documentInfoExternalStorage),
      },
    );

    assert.isTrue(Result.isErr(offchainResult));
    assert.isTrue(Result.isErr(storageResult));
    assert.isTrue(Result.isErr(externalStorageResult));
  });

  it("Downloading non existing document does not work", async () => {
    const notExistingDocumentId = "not_existing_id";
    const offchainResult = await getDocument(ctx, alice, workflowitemId, notExistingDocumentId, {
      ...repository,
      getOffchainDocument: () => Promise.resolve(uploadedOffChainDocument),
      getDocumentInfo: () => Promise.resolve(undefined),
    });
    const storageResult = await getDocument(ctx, alice, workflowitemId, notExistingDocumentId, {
      ...repository,
      getOffchainDocument: () => Promise.resolve(undefined),
      getDocumentFromStorage: () => Promise.resolve(uploadedStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoStorage),
    });
    const externalStorageResult = await getDocument(
      ctx,
      alice,
      workflowitemId,
      notExistingDocumentId,
      {
        ...repository,
        getOffchainDocument: () => Promise.resolve(undefined),
        getDocumentFromExternalStorage: () => Promise.resolve(uploadedExternalStorageDocument),
        getDocumentInfo: () => Promise.resolve(documentInfoExternalStorage),
      },
    );

    assert.isTrue(Result.isErr(offchainResult));
    assert.isTrue(Result.isErr(storageResult));
    assert.isTrue(Result.isErr(externalStorageResult));
  });
});
