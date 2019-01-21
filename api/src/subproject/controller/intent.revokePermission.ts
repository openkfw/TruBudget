import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain/Client.h";
import { changeSubprojectPermission } from "../intent";

export async function revokeSubprojectPermission(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  return changeSubprojectPermission(multichain, req, "subproject.intent.revokePermission");
}
