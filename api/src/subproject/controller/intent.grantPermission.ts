import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import { changeSubprojectPermission } from "./intent";

export async function grantSubprojectPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  return changeSubprojectPermission(multichain, req, "subproject.intent.grantPermission");
}
