import { assert, expect } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { PublicKeyBase64 } from "../organization/public_key";
import { getPublicKey, publicKeyAlreadyExists } from "../organization/public_key_get";
import { BusinessEvent } from "../business_event";
import { VError } from "verror";
import { updatePublicKey } from "./public_key_update";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = { id: "alice", groups: ["alice"] };
const publicKey = "public_key";
const repository = {
  getPublicKey: (organization) => Promise.resolve(publicKey),
};

const requestData = { organization: "organization", publicKey: "newPublicKey" };

describe("Public key: Update", async () => {
  it("Updating a public key of an existing organization works", async () => {
    const result = await updatePublicKey(ctx, alice, requestData, repository);
    assert.isTrue(Result.isOk(result));
  });

  it("Updating a public key of an non-existing organization does not work", async () => {
    const result = await updatePublicKey(ctx, alice, requestData, {
      getPublicKey: (organization) =>
        Promise.resolve(new VError(organization, "couldn't get public key")),
    });
    assert.isTrue(Result.isErr(result));
  });
  it("Updating a public key with the same key does not work", async () => {
    const result = await updatePublicKey(
      ctx,
      alice,
      { organization: "organization", publicKey },
      repository,
    );
    assert.isTrue(Result.isErr(result));
  });
});
