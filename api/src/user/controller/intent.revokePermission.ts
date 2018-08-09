import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import { changeUserPermission } from "../changeUserPermission";

export async function revokeUserPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  return changeUserPermission(multichain, req, "user.intent.revokePermission");
}
