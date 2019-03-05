import { HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../service/Client.h";
import { changeWorkflowitemPermission } from "../intent";

export async function grantWorkflowitemPermission(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  return changeWorkflowitemPermission(multichain, req, "workflowitem.intent.grantPermission");
}
