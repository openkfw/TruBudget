import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";

import { publishPublicKey } from "./public_key_publish";
import { ServiceUser } from "./service_user";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const address = "address";
const alice: ServiceUser = { id: "alice", groups: ["alice"], address };

const repository = {
  publicKeyAlreadyExists: async (organization: string): Promise<boolean> => {
    if (organization === "organization") {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
};

describe("Public key: Publish", async () => {
  it("Publishing an existing public key works if public key does not exist", async () => {
    const requestData = {
      organization: "organization_without_publickey",
      publicKey: "PublicKeyBase64",
    };

    const result = await publishPublicKey(ctx, alice, requestData, repository);
    assert.isTrue(Result.isOk(result));
  });

  it("Publishing an existing public key does not work if public key already exists", async () => {
    const requestData = {
      organization: "organization",
      publicKey: "PublicKeyBase64",
    };

    const result = await publishPublicKey(ctx, alice, requestData, repository);
    assert.isTrue(Result.isErr(result));
  });
});
