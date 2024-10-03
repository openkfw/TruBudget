import logger from "../../../lib/logger";
import { BusinessEvent } from "../business_event";

export function sourceStorageServiceUrls(events: BusinessEvent[]): Map<string, string> {
  const urls = new Map<string, string>();

  for (const event of events) {
    applyStorageServiceUrls(urls, event);
  }
  return urls;
}

export function applyStorageServiceUrls(urls: Map<string, string>, event: BusinessEvent): void {
  logger.trace("Applying storage service url");
  if (event.type === "storage_service_url_published") {
    const { organization, organizationUrl } = event;
    urls.set(organization, organizationUrl);
  }
}
