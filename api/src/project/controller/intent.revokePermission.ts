/**
 * DEPRECATED - see index.ts
 */
import { HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain/Client.h";
import { changeProjectPermission } from "../intent";

export async function revokeProjectPermission(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  return changeProjectPermission(multichain, req, "project.intent.revokePermission");
}
