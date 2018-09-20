import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import { changeProjectPermission } from "../intent";

export async function revokeProjectPermission(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  return changeProjectPermission(multichain, req, "project.intent.revokePermission");
}
