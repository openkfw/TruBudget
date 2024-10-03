import { assert, expect } from "chai";

import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";

import { getAllStorageServiceUrls, getStorageServiceUrl } from "./storage_service_url_get";

const existingOrganization = "organization";
const existingOrganizationUrl = "organizationUrl";
const storageServiceUrlEvent: BusinessEvent = {
  type: "storage_service_url_published",
  source: "string",
  time: "string",
  publisher: "alice",
  organization: existingOrganization,
  organizationUrl: existingOrganizationUrl,
};

const repository = {
  getStorageServiceUrlPublishedEvents: (): Promise<BusinessEvent[]> =>
    Promise.resolve([storageServiceUrlEvent]),
};

describe("Storage service URL", () => {
  it("Get all storage service URLs", async () => {
    const result = await getAllStorageServiceUrls(repository);
    assert.isTrue(Result.isOk(result));
  });

  it("Get storage service URL from existing organization works", async () => {
    const result = await getStorageServiceUrl(existingOrganization, repository);
    assert.isTrue(Result.isOk(result));
  });

  it("Get storage service URL from non-existing organization returns undefined", async () => {
    const result = await getStorageServiceUrl("non-existing-organization", repository);
    assert.isTrue(Result.isOk(result));
    expect(result).to.eql(undefined);
  });
});
