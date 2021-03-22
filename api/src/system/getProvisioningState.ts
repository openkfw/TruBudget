import { HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";
import { MultichainClient, StreamItem } from "../service/Client.h";

export async function getProvisioningState(multichain: MultichainClient): Promise<HttpResponse> {
  let message = "The Multichain has never been provisioned";
  let isProvisioned = false;
  let isStartFlagSet = false;
  let isEndFlagSet = false;

  try {
    const systemStreamItems: StreamItem[] = await multichain.streamItems("system_information");
    // Iterate through the items from the end to the beginning
    // Provisioning was successfully if  a start-flag is followed by an end-flag
    // eslint-disable-next-line for-direction
    for (let i = systemStreamItems.length - 1; i >= 0; i--) {
      if (systemStreamItems[i].value.json.type === "provisioning_started") {
        isStartFlagSet = true;
        if (isEndFlagSet) {
          message = "The Multichain has already been provisioned successfully";
          isProvisioned = true;
          break;
        }
        if (!isEndFlagSet) {
          message = "The Multichain has been provisioned partly (no provisioning_ended flag set)";
          isProvisioned = false;
          break;
        }
        continue;
      }
      if (systemStreamItems[i].value.json.type === "provisioning_ended") {
        isEndFlagSet = true;
        // only start flags from the left side of the array from the end flag belongs to the end flag
        isStartFlagSet = false;
      }
    }
  } catch (err) {
    logger.error({ error: err }, "Error during getProvisioningState method");
  }
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        isProvisioned,
        message,
      },
    },
  ];
}
