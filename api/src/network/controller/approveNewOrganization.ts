import { HttpResponse } from "../../httpd/lib";
import { Ctx } from "../../lib/ctx";
import logger from "../../lib/logger";
import { isNonemptyString, value } from "../../lib/validation";
import { ConnToken } from "../../service/conn";
import { ServiceUser } from "../../service/domain/organization/service_user";
import * as Nodes from "../model/Nodes";
import { voteHelper } from "../voteHelper";

export async function approveNewOrganization(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> {
  const multichain = conn.multichainClient;

  const input = value("data", req.body.data, (x) => x !== undefined);
  const organization: string = value("organization", input.organization, isNonemptyString);

  const futureOrganizationAddress = await Nodes.get(multichain).then((infos) =>
    infos
      .filter((x) => x.address.organization === organization)
      .map((x) => x.address.address)
      .find((_) => true),
  );

  if (!futureOrganizationAddress) {
    const message = `No node registered for organization '${organization}'`;
    logger.error({ err: { organization, multichain, input } }, message);
    throw Error(message);
  }

  return voteHelper(conn, ctx, issuer, req.user, futureOrganizationAddress, "admin");
}
