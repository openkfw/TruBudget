import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import { changeSubprojectPermission } from "../intent";

export async function revokeSubprojectPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  return changeSubprojectPermission(multichain, req, "subproject.intent.revokePermission");
}
