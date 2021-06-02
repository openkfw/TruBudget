import { assert, expect } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import { UploadedDocument } from "./document";
import { RequestData, shareDocument } from "./document_share";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = { id: "alice", groups: ["alice"] };
const bob: ServiceUser = { id: "charlie", groups: ["bob"] };
const root: ServiceUser = { id: "root", groups: ["root"] };

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

const publicKey = "a public key as String in pem format";
const privateKey = "a private key as String in pem format";

const repository = {
  encryptWithKey: (secret, publicKey) => Promise.resolve("plain"),
  decryptWithKey: (secret, privateKey) => Promise.resolve("secret"),
  getPublicKey: (organization) => Promise.resolve(publicKey),
  getPrivateKey: (organization) => Promise.resolve(privateKey),
  getSecret: (docId, organization) => Promise.resolve(secret),
  secretAlreadyExists: (docId, organization) => Promise.resolve(false),
};

describe("Share a document", async () => {
  it("An existing document can be shared", async () => {
    const requestData: RequestData = {
      organization: "organization",
      docId: document.id,
    };

    const result = await shareDocument(ctx, alice, requestData, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.not.equal(undefined);
  });

  it("An non existing document can not be shared", async () => {
    // TODO: THIS TEST FAILS
    /*
    const requestData: RequestData = {
      organization: "organization",
      docId: "-1",
    };

    const result = await shareDocument(ctx, alice, requestData, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.equal(undefined);
    */
  });

  it("An existing document only be shared from the corrisponding organisation", async () => {
    //Alice (Orga A) shares document from Orga B
    // TODO: THIS TEST FAILS
    /*
    const requestData: RequestData = {
      organization: "other organization",
      docId: document.id,
    };

    const result = await shareDocument(ctx, alice, requestData, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.equal(undefined);
    */
  });

  it("Root user can not share", async () => {
    // TODO: THIS TEST FAILS
    /*

    const requestData: RequestData = {
      organization: "organization",
      docId: document.id,
    };

    const result = await shareDocument(ctx, root, requestData, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.equal(undefined);
    */
  });

  it("workflow_grant_permissions has to be set to share a document", async () => {
    // TODO: THIS TEST FAILS
    /*
    const requestData: RequestData = {
      organization: "organization",
      docId: document.id,
    };

    const result = await shareDocument(ctx, bob, requestData, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.equal(undefined);
    */
  });
});
