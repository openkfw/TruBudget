import { assert, expect } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { UserRecord } from "../organization/user_record";
import { Workflowitem } from "../workflow/workflowitem";
import { DocumentOrExternalLinkReference, StoredDocument, UploadedDocument } from "./document";
import { RequestData, shareDocument } from "./document_share";
import { SecretPublished } from "./document_shared";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const address = "address";
const alice: ServiceUser = { id: "alice", groups: ["alice"], address };
const bob: ServiceUser = { id: "bob", groups: ["bob"], address };
const root: ServiceUser = { id: "root", groups: ["root"], address };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy-workflowitem";
const document: UploadedDocument = {
  id: "1",
  base64: "lakjflaksdjf",
  fileName: "dummyFile",
};

const secret = {
  docId: document.id,
  organization: "organization",
  encryptedSecret: "secret",
};

const baseUser: UserRecord = {
  id: "alice",
  createdAt: new Date().toISOString(),
  displayName: "baseUser",
  organization: "organization",
  passwordHash: "12345",
  address: "12345",
  encryptedPrivKey: "12345",
  permissions: {
    "workflowitem.intent.grantPermission": [alice.id],
  },
  log: [],
  additionalData: {},
};
const requestData: RequestData = {
  organization: "organization",
  docId: document.id,
  projectId,
  subprojectId,
  workflowitemId,
};

const documentId = "1";
const documentHash = "hash";
const documentFileName = "name";
const organization = "organization";
const organizationUrl = "url";

const documents: DocumentOrExternalLinkReference[] = [
  {
    id: documentId,
    hash: documentHash,
    fileName: documentFileName,
  },
];
const documentInfo: StoredDocument = {
  id: documentId,
  fileName: documentFileName,
  organization,
  organizationUrl,
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
  documents,
  permissions: { "workflowitem.intent.grantPermission": ["alice"] },
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

const repository = {
  encryptWithKey: (secret, publicKey): Promise<string> => Promise.resolve("plain"),
  decryptWithKey: (secret, privateKey): Promise<string> => Promise.resolve("secret"),
  getPublicKey: (organization): Promise<string> => Promise.resolve(organization),
  getPrivateKey: (organization): Promise<string> => Promise.resolve(""),
  getSecret: (docId, organization): Promise<SecretPublished> => Promise.resolve(secret),
  secretAlreadyExists: (docId, organization): Promise<boolean> => Promise.resolve(false),
  getWorkflowitem: (projectId, subprojectId, workflowitemId): Promise<Workflowitem> =>
    Promise.resolve(baseWorkflowitem),
  getDocumentInfo: (docId): Promise<StoredDocument> => Promise.resolve(documentInfo),
};

describe("Share a document", async () => {
  it("An existing document can be shared by a user with workflowitem.intent.grantPermission permission", async () => {
    const result = await shareDocument(ctx, alice, requestData, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.not.equal(undefined);
    expect(result).to.include({ type: "secret_published" });
  });

  it("An existing document cannot be shared without the workflowitem.intent.grantPermission permission", async () => {
    const result = await shareDocument(ctx, bob, requestData, repository);

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("A non existing document can not be shared", async () => {
    const result = await shareDocument(
      ctx,
      alice,
      { ...requestData, docId: "-1" },
      {
        ...repository,
        getWorkflowitem: (projectId, subprojectId, workflowitemId) =>
          Promise.resolve({ ...baseWorkflowitem, documents: [] }),
        getSecret: (docId, organization) => Promise.resolve(new Error("Could not find")),
      },
    );

    assert.isTrue(Result.isErr(result));
  });

  it("Root user can not share", async () => {
    const result = await shareDocument(ctx, root, requestData, repository);
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });
});
