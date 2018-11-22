import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import logger from "../../lib/logger";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as Nodes from "../model/Nodes";
import { voteHelper } from "../voteHelper";

export async function approveNewOrganization(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);
  const organization: string = value("organization", input.organization, isNonemptyString);

  const futureOrganizationAddress = await Nodes.get(multichain).then(infos =>
    infos
      .filter(x => x.address.organization === organization)
      .map(x => x.address.address)
      .find(_ => true),
  );

  if (!futureOrganizationAddress) {
    logger.error(
      { error: { organization, multichain, input } },
      `No node registered for organization '${organization}'`,
    );
    throw Error(`no node registered for organization "${organization}"`);
  }

  return voteHelper(multichain, req.user, futureOrganizationAddress, "admin");
}
