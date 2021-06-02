import { VError } from "verror";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { sourceStorageServiceUrls } from "./storage_service_url_eventsourcing";

interface Repository {
  getStorageServiceUrlPublishedEvents(): Promise<Result.Type<BusinessEvent[]>>;
}

export async function getAllStorageServiceUrls(
  repository: Repository,
): Promise<Result.Type<Map<string, string>>> {
  const organizationUrlEvents = await repository.getStorageServiceUrlPublishedEvents();
  if (Result.isErr(organizationUrlEvents)) {
    return new VError(organizationUrlEvents, "cannot get events");
  }
  const urls = sourceStorageServiceUrls(organizationUrlEvents);
  return urls;
}

export async function getStorageServiceUrl(
  organization,
  repository,
): Promise<Result.Type<string | undefined>> {
  const urls = await getAllStorageServiceUrls(repository);
  if (Result.isErr(urls)) {
    return new VError(urls, "cannot source urls");
  }
  return urls.get(organization);
}
