import { HttpResponse } from "../../httpd/lib";
import { Ctx } from "../../lib/ctx";
import { isNonemptyString, value } from "../../lib/validation";
import { ConnToken } from "../../service";
import { ServiceUser } from "../../service/domain/organization/service_user";
import * as Nodes from "../model/Nodes";
import { voteHelper } from "../voteHelper";

export async function approveNewNodeForExistingOrganization(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);
  const targetAddress: Nodes.WalletAddress = value("address", input.address, isNonemptyString);

  return voteHelper(conn, ctx, issuer, req.user, targetAddress, "basic");
}
