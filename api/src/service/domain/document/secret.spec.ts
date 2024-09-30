import { assert, expect } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";

import { getAllSecrets, getSecret, secretAlreadyExists } from "./secret_get";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const existingOrganization = "organization";
const existingDocument = "1001";
const encryptedSecret = "encryptedSecret";
const secretPublishedEvent: BusinessEvent = {
  type: "secret_published",
  source: "",
  time: "",
  publisher: "",
  docId: existingDocument,
  organization: existingOrganization,
  encryptedSecret: encryptedSecret,
};

const repository = {
  getSecretPublishedEvents: (): Promise<BusinessEvent[]> => Promise.resolve([secretPublishedEvent]),
};

describe("Get secrets for storage-service", async () => {
  it("Get all secrets works", async () => {
    const result = await getAllSecrets(ctx, repository);

    assert.isTrue(Result.isOk(result));
    expect(result[0]).to.not.equal(undefined);
    expect(result[0]).to.include({ docId: existingDocument });
    expect(result[0]).to.include({ organization: existingOrganization });
    expect(result[0]).to.include({ encryptedSecret: encryptedSecret });
  });

  it("Get an existing secret works", async () => {
    const result = await getSecret(ctx, existingDocument, existingOrganization, repository);

    assert.isTrue(Result.isOk(result));
    expect(result).to.not.equal(undefined);
    expect(result).to.include({ docId: existingDocument });
    expect(result).to.include({ organization: existingOrganization });
    expect(result).to.include({ encryptedSecret: encryptedSecret });
  });

  it("Get a non-existing secret fails", async () => {
    const nonExistingDocument = "non-existing";
    const result = await getSecret(ctx, nonExistingDocument, existingOrganization, repository);

    assert.isTrue(Result.isErr(result));
  });

  it("Check if an existing documents exists", async () => {
    const result = await secretAlreadyExists(
      ctx,
      existingDocument,
      existingOrganization,
      repository,
    );

    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(true);
  });

  it("Check if a non-existing documents exists", async () => {
    const nonExistingDocument = "non-existing";
    const result = await secretAlreadyExists(
      ctx,
      nonExistingDocument,
      existingOrganization,
      repository,
    );

    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(false);
  });
});
