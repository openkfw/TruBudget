import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { Ctx } from "../../lib/ctx";
import { ConnToken } from "../../service";
import { ServiceUser } from "../../service/domain/organization/service_user";
import * as GlobalPermissionsGet from "../../service/global_permissions_get";
import * as Nodes from "../model/Nodes";

export async function getActiveNodes(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const multichain = conn.multichainClient;

  // Permission check:
  const userIntent: Intent = "network.listActive";
  const globalPermissions = (await GlobalPermissionsGet.getGlobalPermissions(conn, ctx, issuer))
    .permissions;
  await throwIfUnauthorized(req.user, userIntent, globalPermissions);

  // Get ALL the info:
  const numberOfConnections = await Nodes.active(multichain);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        peers: numberOfConnections,
      },
    },
  ];
}
