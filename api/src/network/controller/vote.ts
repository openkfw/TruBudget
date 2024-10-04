import { VError } from "verror";

import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { config } from "../../config";
import { HttpResponse } from "../../httpd/lib";
import { Ctx } from "../../lib/ctx";
import logger from "../../lib/logger";
import { isNonemptyString, value } from "../../lib/validation";
import { getOrganizationAddress } from "../../organization/organization";
import * as Result from "../../result";
import { ConnToken } from "../../service";
import { MultichainClient } from "../../service/Client.h";
import { ServiceUser } from "../../service/domain/organization/service_user";
import * as GlobalPermissionsGet from "../../service/global_permissions_get";
import * as AccessVote from "../model/AccessVote";
import * as Nodes from "../model/Nodes";

export async function voteForNetworkPermission(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> {
  const multichain = conn.multichainClient;

  // Permission check:
  const userIntent: Intent = "network.voteForPermission";
  const globalPermissionsResult = await GlobalPermissionsGet.getGlobalPermissions(
    conn,
    ctx,
    issuer,
  );
  if (Result.isErr(globalPermissionsResult)) {
    logger.trace("global.grantPermission failed", globalPermissionsResult);
    throw new VError(globalPermissionsResult, "global.grantPermission failed");
  }
  const globalPermissions = globalPermissionsResult.permissions;
  await throwIfUnauthorized(req.user, userIntent, globalPermissions);

  // Input validation:
  const input = value("data", req.body.data, (x) => x !== undefined);
  const targetAddress: Nodes.WalletAddress = value("address", input.address, isNonemptyString);
  const vote: AccessVote.T = value("vote", input.vote, AccessVote.isValid);

  // we cannot rely on organization address from http request, it should be at least verified against the server data
  const callerAddress = await getOrganizationAddress(multichain, req.user.organization);
  if (!callerAddress) {
    const message = `Organization address not found for ${req.user.organization}`;
    logger.error({ err: { issuer, callerAddress, targetAddress, vote } }, message);
    return [404, { apiVersion: "1.0", error: { code: 404, message } }];
  }
  if (callerAddress !== req.user.organizationAddress) {
    const message = `Organization address mismatch: ${callerAddress} !== ${req.user.organizationAddress} (from token)`;
    logger.error({ err: { issuer, callerAddress, targetAddress, vote } }, message);
    return [409, { apiVersion: "1.0", error: { code: 409, message } }];
  }

  const currentVote = await getCurrentVote(multichain, callerAddress, targetAddress);

  // Grant or revoke? We need to find out our current vote to know..
  const [operation, permissions] = computeWhatToDo(currentVote, vote);

  if (operation === "grant") {
    await Nodes.grant(multichain, callerAddress, targetAddress, permissions);
  } else if (operation === "revoke") {
    await Nodes.revoke(multichain, callerAddress, targetAddress, permissions);
  } else {
    // no action required
    logger.debug("No action required.");
  }

  return [200, { apiVersion: "1.0", data: {} }];
}

export async function getCurrentVote(
  multichain: MultichainClient,
  callerAddress: Nodes.WalletAddress,
  targetAddress: Nodes.WalletAddress,
): Promise<AccessVote.T> {
  const noOrganizationLookup = new Map<Nodes.WalletAddress, Nodes.Organization>();
  const currentPermissions: Nodes.PermissionInfo[] = await Nodes.getNetworkPermissions(
    multichain,
    targetAddress,
    noOrganizationLookup,
  );

  const adminPermissionInfo = currentPermissions
    .filter((x) => x.permission === "admin")
    .find((_) => true);
  const connectPermissionInfo = currentPermissions
    .filter((x) => x.permission === "connect")
    .find((_) => true);

  const currentVote: AccessVote.T = hasApprover(adminPermissionInfo, callerAddress)
    ? "admin"
    : hasApprover(connectPermissionInfo, callerAddress)
    ? "basic"
    : "none";
  return currentVote;
}

function hasApprover(
  permissionInfo: Nodes.PermissionInfo | undefined,
  maybeApprover: Nodes.WalletAddress,
): boolean {
  if (permissionInfo === undefined) return false;
  return permissionInfo.approvedBy.map((x) => x.address).includes(maybeApprover);
}

function computeWhatToDo(
  current: AccessVote.T,
  next: AccessVote.T,
): ["grant" | "revoke" | "no action", Nodes.NetworkPermission[]] {
  // Makes it easier to read:
  const allPermissions = AccessVote.adminPermissions;
  let basicPermissions = AccessVote.basicPermissions;

  if (config.signingMethod === "user") {
    basicPermissions = [...basicPermissions, "activate"];
  }

  if (current === "admin") {
    if (next === "admin") return ["no action", []];
    if (next === "basic") return ["revoke", AccessVote.exclusiveAdminPermissions];
    if (next === "none") return ["revoke", allPermissions];
  } else if (current === "basic") {
    if (next === "admin") return ["grant", allPermissions];
    if (next === "basic") return ["no action", []];
    if (next === "none") return ["revoke", allPermissions];
  } else if (current === "none") {
    if (next === "admin") return ["grant", allPermissions];
    if (next === "basic") return ["grant", basicPermissions];
    if (next === "none") return ["no action", []];
  }

  throw Error("non-exhaustive switch");
}
