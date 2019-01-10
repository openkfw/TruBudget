/**
 * DEPRECATED - see index.ts
 */
import { HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import { changeProjectPermission } from "../intent";

export async function grantProjectPermission(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  return changeProjectPermission(multichain, req, "project.intent.grantPermission");
}
