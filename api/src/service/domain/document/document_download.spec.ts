import { assert, expect } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { Workflowitem } from "../workflow/workflowitem";
import { DocumentOrExternalLinkReference, StoredDocument, UploadedDocument } from "./document";
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

const projectId = "dummy-project";
const subprojectId = "dummy-subproject";

const documentIdStorage = "2";
const documentIdExternalStorage = "3";
const hash = "hash";

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

const documentInfoStorage: StoredDocument = {
  id: documentIdStorage,
  fileName: uploadedStorageDocument.fileName,
  organization: "organization",
  organizationUrl: "",
};
const documentInfoExternalStorage: StoredDocument = {
  id: documentIdExternalStorage,
  fileName: uploadedExternalStorageDocument.fileName,
  organization: "organization",
  organizationUrl: "organizationUrl",
};

const documentReferences: DocumentOrExternalLinkReference[] = [
  {
    id: "guid1",
    hash,
    fileName: uploadedStorageDocument.fileName,
  },
  {
    id: documentIdStorage,
    hash,
    fileName: uploadedStorageDocument.fileName,
  },
  {
    id: "guid3",
    hash,
    fileName: uploadedExternalStorageDocument.fileName,
  },
  {
    id: documentIdExternalStorage,
    hash,
    fileName: uploadedExternalStorageDocument.fileName,
  },
];

const baseWorkflowitem: Workflowitem = {
  isRedacted: false,
  id: projectId,
  subprojectId,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: alice.id,
  displayName: "dummy",
  description: "dummy",
  amountType: "N/A",
  documents: documentReferences,
  permissions: { "workflowitem.list": ["alice"] },
  log: [],
  additionalData: {},
  workflowitemType: "general",
  tags: [],
};

const secretPublished: DocumentShared.SecretPublished = {
  docId: "override",
  organization: "organization",
  encryptedSecret: "encryptedSecret",
};

const decryptedSecret = "decryptedSecret";
const privateKey = "privateKey";

const repository = {
  getWorkflowitem: (): Promise<Workflowitem> => Promise.resolve(baseWorkflowitem),
  getDocumentFromStorage: (_id, _secret): Promise<UploadedDocument> => {
    throw new VError();
  },
  getDocumentFromExternalStorage: (_id, _secret, _storageServiceUrl): Promise<UploadedDocument> => {
    throw new VError();
  },
  getDocumentInfo: (_docId): Promise<StoredDocument | undefined> => {
    return Promise.resolve(undefined);
  },
  getSecret: (docId, _organization): Promise<DocumentShared.SecretPublished> =>
    Promise.resolve({ ...secretPublished, docId }),
  decryptWithKey: (): Promise<string> => Promise.resolve(decryptedSecret),
  getPrivateKey: (_organization): Promise<string> => Promise.resolve(privateKey),
};

// These tests will work even if the Storage-Service is not enabled.
// Thats because the data from the storage service (internal and external)
// are injected by the getDocumentInfo() method.
// Enabling the storage service in tests is not possible, since it is enabled by
// env variables in config.ts

describe("Download documents attached to a workflowitem", () => {
  it("Internal Storage: Downloading existing documents works", async () => {
    const result = await getDocument(ctx, alice, projectId, documentIdStorage, {
      ...repository,
      getDocumentFromStorage: () => Promise.resolve(uploadedStorageDocument),
      getDocumentFromExternalStorage: () => Promise.resolve(uploadedExternalStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoStorage),
    });

    assert.isTrue(Result.isOk(result));
    expect(result).to.include({ fileName: "storageFile" });
  });

  it("External Storage: Downloading existing documents works", async () => {
    const result = await getDocument(ctx, alice, projectId, documentIdExternalStorage, {
      ...repository,
      getDocumentFromExternalStorage: () => Promise.resolve(uploadedExternalStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoExternalStorage),
    });
    assert.isTrue(Result.isOk(result));
    expect(result).to.include({ fileName: "externalStorageFile" });
  });

  it("Downloading existing documents does not work without workflowitem.list permission", async () => {
    const storageResult = await getDocument(ctx, bob, projectId, documentIdStorage, {
      ...repository,
      getDocumentFromStorage: () => Promise.resolve(uploadedStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoStorage),
    });
    const externalStorageResult = await getDocument(
      ctx,
      bob,
      projectId,
      documentIdExternalStorage,
      {
        ...repository,
        getDocumentFromExternalStorage: () => Promise.resolve(uploadedExternalStorageDocument),
        getDocumentInfo: () => Promise.resolve(documentInfoExternalStorage),
      },
    );

    assert.isTrue(Result.isErr(storageResult));
    assert.isTrue(Result.isErr(externalStorageResult));
  });

  it("Downloading non existing document does not work", async () => {
    const notExistingDocumentId = "not_existing_id";
    const storageResult = await getDocument(ctx, alice, projectId, notExistingDocumentId, {
      ...repository,
      getDocumentFromStorage: () => Promise.resolve(uploadedStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoStorage),
    });
    const externalStorageResult = await getDocument(ctx, alice, projectId, notExistingDocumentId, {
      ...repository,
      getDocumentFromExternalStorage: () => Promise.resolve(uploadedExternalStorageDocument),
      getDocumentInfo: () => Promise.resolve(documentInfoExternalStorage),
    });

    assert.isTrue(Result.isErr(storageResult));
    assert.isTrue(Result.isErr(externalStorageResult));
  });
});
