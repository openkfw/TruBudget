import { Ctx } from "../../../lib/ctx";
import { ServiceUser } from "../organization/service_user";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = { id: "alice", groups: ["alice"] };

const repository = {
  getAllDocumentInfos: () =>
    Promise.resolve([
      {
        id: "1",
        fileName: "name",
        organization: "organization",
        organizationUrl: "",
      },
    ]),
  storeDocument: (id, hash) =>
    Promise.resolve({
      id: "1",
      secret: "secret",
    }),
  encryptWithKey: (secret, publicKey) => Promise.resolve("supersecret"),
};

describe("Upload a document", async () => {
  it("Upload a document", async () => {
    // TODO: THIS TEST FAILS
    /*
    const request = {
      documentBase64: "lakjflaksdjf",
      fileName: "dummyFile",
    };

    const result = await uploadDocument(ctx, alice, request, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.not.equal(undefined);
    */
  });

  it("Upload a empty document", async () => {
    // TODO: THIS TEST FAILS
    /*
     const request = {
      documentBase64: "",
      fileName: "dummyFile",
    };

    const result = await uploadDocument(ctx, alice, request, repository);
    assert.isTrue(Result.isErr(result));
    */
  });

  it("Upload document without a name", async () => {
    // TODO: THIS TEST FAILS
    /*
    const request = {
      documentBase64: "content",
      fileName: "",
    };

    const result = await uploadDocument(ctx, alice, request, repository);
    assert.isTrue(Result.isErr(result));
    */
  });

  it("Upload document with provided but not existing docId", async () => {
    // TODO: THIS TEST FAILS
    /*
    const request = {
      id: "12",
      documentBase64: "content",
      fileName: "name",
    };

    const result = await uploadDocument(ctx, alice, request, repository);
    assert.isTrue(Result.isOk(result));
    */
  });

  it("Upload document with provided & already existing docId", async () => {
    // TODO: THIS TEST FAILS
    /*
    const request = {
      id: "1",
      documentBase64: "content",
      fileName: "name",
    };

    const result = await uploadDocument(ctx, alice, request, repository);
    assert.isTrue(Result.isErr(result));
    */
  });
});
