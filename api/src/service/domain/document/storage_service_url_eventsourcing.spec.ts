import { assert, expect } from "chai";

import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";

import { sourceStorageServiceUrls } from "./storage_service_url_eventsourcing";

const existingOrganization1 = "organization1";
const existingOrganizationUrl1 = "organizationUrl1";
const storageServiceUrlEvent1: BusinessEvent = {
  type: "storage_service_url_published",
  source: "string",
  time: "string",
  publisher: "alice",
  organization: existingOrganization1,
  organizationUrl: existingOrganizationUrl1,
};

const existingOrganization2 = "organization2";
const existingOrganizationUrl2 = "organizationUrl2";
const storageServiceUrlEvent2: BusinessEvent = {
  type: "storage_service_url_published",
  source: "string",
  time: "string",
  publisher: "alice",
  organization: existingOrganization2,
  organizationUrl: existingOrganizationUrl2,
};

describe("Storage Service Url eventsourcing", () => {
  it("Storage service url published: source secret from event", async () => {
    const result = await sourceStorageServiceUrls([
      storageServiceUrlEvent1,
      storageServiceUrlEvent2,
    ]);
    assert.isTrue(Result.isOk(result));
    expect(result.get(existingOrganization1)).to.eql(existingOrganizationUrl1);
    expect(result.get(existingOrganization2)).to.eql(existingOrganizationUrl2);
  });
});
