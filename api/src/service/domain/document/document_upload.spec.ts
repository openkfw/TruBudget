import { assert, expect } from "chai";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { uploadDocument } from "./document_upload";
import { UserRecord } from "../organization/user_record";
import { PreconditionError } from "../errors/precondition_error";
import { VError } from "verror";
import { NotFound } from "../errors/not_found";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = { id: "alice", groups: ["alice"], address: "address" };
const root: ServiceUser = { id: "root", groups: ["root"], address: "address" };
const fileName = "dummyFile";
const id = "dummyId";

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
    id: "1",
    fileName,
    organization: "organization",
    organizationUrl: "",
  },
];

const requestData = {
  id,
  documentBase64: "content",
  fileName,
};

const repository = {
  getAllDocuments: () => Promise.resolve(existingDocuments),
  storeDocument: (id, name, hash) =>
    Promise.resolve({
      id: "1",
      secret: "secret",
    }),
  encryptWithKey: (secret, publicKey) => Promise.resolve("supersecret"),
  getPublicKey: (organization) => Promise.resolve("ThePublicKeyBase64"),
  getUser: async () => aliceUserRecord,
};

// These tests are only for the storage service document upload
// Offchain document upload is tested in workflowitem_update.spec.ts
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
      encryptWithKey: (organization) => Promise.resolve(new VError("failed to encrypt secret")),
    });
    assert.isTrue(Result.isErr(result));
  });
  it("Uploading document fails if storing the document failed", async () => {
    const result = await uploadDocument(ctx, alice, requestData, {
      ...repository,
      storeDocument: (id, name, hash) => Promise.resolve(new VError("failed to store document")),
    });
    assert.isTrue(Result.isErr(result));
  });

  it("Uploading document fails if no secret is retured from storage service", async () => {
    const result = await uploadDocument(ctx, alice, requestData, {
      ...repository,
      storeDocument: (id, name, hash) => Promise.resolve({ id, secret: undefined } as any),
    });
    assert.isTrue(Result.isErr(result));
  });

  it("Root user is not allowed to upload documents", async () => {
    const result = await uploadDocument(ctx, root, requestData, repository);
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });
});
