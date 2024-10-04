import { assert } from "chai";
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";

import { updatePublicKey } from "./public_key_update";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const address = "address";
const alice: ServiceUser = { id: "alice", groups: ["alice"], address };
const publicKey = "public_key";
const repository = {
  getPublicKey: (_organization): Promise<string> => Promise.resolve(publicKey),
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
