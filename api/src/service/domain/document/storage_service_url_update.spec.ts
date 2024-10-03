import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";

import { storageServiceUrlPublish } from "./storage_service_url_update";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};

const alice: ServiceUser = { id: "alice", groups: ["alice"], address: "address" };

describe("Storage service URL update/publish", () => {
  it("Publish a new storage-service", async () => {
    const requestData = {
      organization: "string",
      organizationUrl: "string",
    };
    const result = await storageServiceUrlPublish(ctx, alice, requestData);
    assert.isTrue(Result.isOk(result));
  });
});
