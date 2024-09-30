import { assert, expect } from "chai";
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { getPublicKey, publicKeyAlreadyExists } from "../organization/public_key_get";
import { ServiceUser } from "../organization/service_user";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};
const address = "address";
const alice: ServiceUser = { id: "alice", groups: ["alice"], address };

const publicKey = "ThePublicKey";

const publicKeyEvent: BusinessEvent = {
  type: "public_key_published",
  source: "string",
  time: "string",
  publisher: alice.id,
  organization: "organization",
  publicKey: publicKey,
};

describe("Public key: Get", async () => {
  it("Getting a public key of an existing organization works", async () => {
    const repository = {
      getPublicKeysEvents: (): Promise<BusinessEvent[]> => Promise.resolve([publicKeyEvent]),
    };

    const result = await getPublicKey(ctx, "organization", repository);
    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(publicKey);
  });

  it("Getting a public key of an non-existing organization does not work", async () => {
    const repository = {
      getPublicKeysEvents: (): Promise<BusinessEvent[]> => Promise.resolve([publicKeyEvent]),
    };

    const result: Result.Type<string> = await getPublicKey(ctx, "other_organization", repository);
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, VError);
    expect(result).to.not.eql(publicKey);
  });

  it("A public key exists for an organization if already created", async () => {
    const repository = {
      getPublicKeysEvents: (): Promise<BusinessEvent[]> => Promise.resolve([publicKeyEvent]),
    };

    const result = await publicKeyAlreadyExists(ctx, "organization", repository);
    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(true);
  });

  it("A public key does not exist for an organization if not created", async () => {
    const repository = {
      getPublicKeysEvents: (): Promise<BusinessEvent[]> => Promise.resolve([publicKeyEvent]),
    };

    const result = await publicKeyAlreadyExists(ctx, "other_organization", repository);
    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(false);
  });
});
