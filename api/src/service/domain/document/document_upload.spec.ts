/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert, expect } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { UserRecord } from "../organization/user_record";
import { uploadDocument } from "./document_upload";
import { DocumentReference, StoredDocument } from "./document";
import { VError } from "verror";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = { id: "alice", groups: ["alice"], address: "address" };
const root: ServiceUser = { id: "root", groups: ["root"], address: "address" };
const fileName = "dummyFile";
const id = "dummyId";
const docId = "1";

const aliceUserRecord: UserRecord = {
  id: alice.id,
  createdAt: new Date().toISOString(),
  displayName: "Alice",
  organization: "organization",
  passwordHash: "12345",
  address: "12345",
  encryptedPrivKey: "12345",
  permissions: {},
  log: [],
  additionalData: {},
};

const existingDocuments = [
  {
    id: docId,
    fileName,
    organization: "organization",
    organizationUrl: "",
  },
];
const documentReferences: DocumentReference[] = [{ id: docId, fileName, hash: "hash" }];

const requestData = {
  id,
  documentBase64: "content",
  fileName,
};

const repository = {
  getAllDocumentInfos: (): Promise<StoredDocument[]> => Promise.resolve(existingDocuments),
  getAllDocumentReferences: (): Promise<DocumentReference[]> => Promise.resolve(documentReferences),
  storeDocument: (_id, _name, _hash): Promise<any> =>
    Promise.resolve({
      id: "1",
      secret: "secret",
    }),
  encryptWithKey: (_secret, _publicKey): Promise<string> => Promise.resolve("supersecret"),
  getPublicKey: (_organization): Promise<string> => Promise.resolve("ThePublicKeyBase64"),
  getUser: async (): Promise<UserRecord> => aliceUserRecord,
};

describe("Storage Service: Upload a document", async () => {
  it("Uploading a document works", async () => {
    const result = await uploadDocument(ctx, alice, requestData, repository);
    // expect(JSON.stringify(result)).to.eql("undefined");
    assert.isTrue(Result.isOk(result));
    expect(result[0]).to.not.equal(undefined);
    expect(result[0]).to.include({ fileName: "dummyFile" });
  });

  it("Uploading an empty document results in an error", async () => {
    const result = await uploadDocument(
      ctx,
      alice,
      { ...requestData, documentBase64: "" },
      repository,
    );
    assert.isTrue(Result.isErr(result));
  });

  it("Uploading document without a name will be named as 'untitled'", async () => {
    const result = await uploadDocument(ctx, alice, { ...requestData, fileName: "" }, repository);
    assert.isTrue(Result.isOk(result));
    expect(result[0]).to.include({ fileName: "untitled" });
  });

  it("Uploading document with provided & already existing docId results in an error", async () => {
    const result = await uploadDocument(ctx, alice, { ...requestData, id: "1" }, repository);
    assert.isTrue(Result.isErr(result));
  });

  it("Uploading document fails if no public key is found", async () => {
    const result = await uploadDocument(ctx, alice, requestData, {
      ...repository,
      getPublicKey: (organization) =>
        Promise.resolve(
          new VError(
            new NotFound(ctx, "key", "public"),
            `couldn't get public key of organization ${organization}`,
          ),
        ),
    });
    assert.isTrue(Result.isErr(result));
  });

  it("Uploading document fails if encryption failed", async () => {
    const result = await uploadDocument(ctx, alice, requestData, {
      ...repository,
      encryptWithKey: (_organization) => Promise.resolve(new VError("failed to encrypt secret")),
    });
    assert.isTrue(Result.isErr(result));
  });
  it("Uploading document fails if storing the document failed", async () => {
    const result = await uploadDocument(ctx, alice, requestData, {
      ...repository,
      storeDocument: (_id, _name, _hash) => Promise.resolve(new VError("failed to store document")),
    });
    assert.isTrue(Result.isErr(result));
  });

  it("Uploading document fails if no secret is returned from storage service", async () => {
    const result = await uploadDocument(ctx, alice, requestData, {
      ...repository,
      storeDocument: (id, _name, _hash) => Promise.resolve({ id, secret: undefined } as any),
    });
    assert.isTrue(Result.isErr(result));
  });

  it("Root user is not allowed to upload documents", async () => {
    const result = await uploadDocument(ctx, root, requestData, repository);
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });
});
