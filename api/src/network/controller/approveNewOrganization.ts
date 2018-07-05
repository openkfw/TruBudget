import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import * as Global from "../../global";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as Nodes from "../model/Nodes";
import { voteHelper } from "../voteHelper";

export async function approveNewOrganization(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  // Permission check:
  const userIntent: Intent = "network.approveNewOrganization";
  await throwIfUnauthorized(req.token, userIntent, await Global.getPermissions(multichain));

  // Input validation:
  const input = value("data", req.body.data, x => x !== undefined);
  const organization: string = value("organization", input.organization, isNonemptyString);

  const futureOrganizationAddress = await Nodes.get(multichain).then(infos =>
    infos
      .filter(x => x.address.organization === organization)
      .map(x => x.address.address)
      .find(_ => true),
  );

  if (!futureOrganizationAddress) {
    throw Error(`no node registered for organization "${organization}"`);
  }

  return voteHelper(multichain, req.token, futureOrganizationAddress, "admin");
}
