import { VError } from "verror";
import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { HttpResponse } from "../../httpd/lib";
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import * as Result from "../../result";
import { ConnToken } from "../../service";
import { ServiceUser } from "../../service/domain/organization/service_user";
import * as GlobalPermissionsGet from "../../service/global_permissions_get";
import * as AccessVote from "../model/AccessVote";
import * as Nodes from "../model/Nodes";
import { AugmentedWalletAddress, WalletAddress } from "../model/Nodes";
import { getLatestDateOnlineByAddress } from "../../network/controller/logNodes";

const basicPermission: Nodes.NetworkPermission = "connect";
const adminPermission: Nodes.NetworkPermission = "admin";

interface CurrentAccess {
  accessType: AccessVote.T;
  approvers: AugmentedWalletAddress[];
  decliners: AugmentedWalletAddress[];
}

interface PendingAccess {
  accessType: AccessVote.T;
  approvers: AugmentedWalletAddress[];
  // Number of votes remaining for pending access to become effective:
  nWantingApprovers: number;
}

interface NodeInfoDto {
  address: AugmentedWalletAddress;
  myVote: AccessVote.T;
  currentAccess: CurrentAccess;
  pendingAccess?: PendingAccess;
  isConnected?: boolean;
  lastSeen?: string;
}

export async function getNodeList(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> {
  const multichain = conn.multichainClient;

  // Permission check:
  const userIntent: Intent = "network.list";
  const globalPermissionsResult = await GlobalPermissionsGet.getGlobalPermissions(
    conn,
    ctx,
    issuer,
  );
  if (Result.isErr(globalPermissionsResult)) {
    throw new VError(globalPermissionsResult, "global.grantPermission failed");
  }
  const globalPermissions = globalPermissionsResult.permissions;
  await throwIfUnauthorized(req.user, userIntent, globalPermissions);

  // Get ALL the info:
  const nodes = await Nodes.get(multichain);

  // The caller is not supposed to know anything about MultiChain's permission model, so
  // it's simplified to the following three levels here that refer to the organization's
  // (main) wallet address:
  //
  // - NO ACCESS: the organization is not allowed to join the network.
  // In terms of MultiChain, the address lacks the "connect" permission.
  // - BASIC ACCESS: the organization is allowed to join the network and might have
  // additional permissions, but it definitely lacks admin permissions.
  // - ADMIN ACCESS: the organization has admin permission and, by extension, permissions
  // to do anything with the network (while respecting the settings for admin consensus).

  // TODO (future): The current implementation does not consider the case where the organizationAddress from user's request is invalid
  const myAddress: WalletAddress = req.user.organizationAddress;
  const dtoList: NodeInfoDto[] = nodes.map((info) => dtoFromNodeInfo(info, myAddress));

  const list: NodeInfoDto[] = await Promise.all(
    dtoList.map(async (node) => {
      if (myAddress === node.address.address) {
        return node;
      }
      const lastSeen = await getLatestDateOnlineByAddress(multichain, node.address.address);
      if (!lastSeen) {
        return node;
      }
      const enhancedNod = {
        ...node,
        lastSeen: lastSeen,
      };
      return enhancedNod;
    }),
  );
  logger.debug({ nodes, myAddress, list: dtoList }, "List of nodes received");

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        nodes: list,
      },
    },
  ];
}

function dtoFromNodeInfo(info: Nodes.NodeInfo, callerAddress: WalletAddress): NodeInfoDto {
  const adminPermissionInfo = getPermissionInfo(info, adminPermission);
  const basicPermissionInfo = getPermissionInfo(info, basicPermission);

  const hasAdminApprovers =
    adminPermissionInfo === undefined ? false : adminPermissionInfo.approvedBy.length > 0;
  const hasAdminChangePending =
    adminPermissionInfo === undefined ? false : adminPermissionInfo.changeRequestedBy.length > 0;

  const hasBasicApprovers =
    basicPermissionInfo === undefined ? false : basicPermissionInfo.approvedBy.length > 0;
  const hasBasicChangePending =
    basicPermissionInfo === undefined ? false : basicPermissionInfo.changeRequestedBy.length > 0;

  let currentAccessType: AccessVote.T;
  let currentAccessApprovers: AugmentedWalletAddress[];
  let pendingAccessType: AccessVote.T | undefined;
  let pendingAccessApprovers: AugmentedWalletAddress[] | undefined;
  let pendingApproversRemaining: number | undefined;
  let currentAccessDecliners: AugmentedWalletAddress[] = info.declinedBy;

  if (hasAdminApprovers && hasAdminChangePending) {
    // admin revocation pending
    currentAccessType = "admin";
    pendingAccessType = hasBasicApprovers ? "basic" : "none";

    currentAccessApprovers = adminPermissionInfo!.approvedBy;
    pendingAccessApprovers = adminPermissionInfo!.changeRequestedBy;
    pendingApproversRemaining = adminPermissionInfo!.changeRequestApprovalsRemaining;
  } else if (hasAdminApprovers) {
    currentAccessType = "admin";
    pendingAccessType = undefined;

    currentAccessApprovers = adminPermissionInfo!.approvedBy;
  } else if (hasAdminChangePending) {
    currentAccessType = hasBasicApprovers ? "basic" : "none";
    pendingAccessType = "admin";

    currentAccessApprovers = hasBasicApprovers ? basicPermissionInfo!.approvedBy : [];
    pendingAccessApprovers = adminPermissionInfo!.changeRequestedBy;
    pendingApproversRemaining = adminPermissionInfo!.changeRequestApprovalsRemaining;
  } else if (hasBasicApprovers && hasBasicChangePending) {
    // basic revocation pending
    currentAccessType = "basic";
    pendingAccessType = "none";

    currentAccessApprovers = basicPermissionInfo!.approvedBy;
    pendingAccessApprovers = [];
    pendingApproversRemaining = 0;
  } else if (hasBasicApprovers) {
    currentAccessType = "basic";
    pendingAccessType = undefined;

    currentAccessApprovers = basicPermissionInfo!.approvedBy;
  } else if (hasBasicChangePending) {
    currentAccessType = "none";
    pendingAccessType = "basic";

    currentAccessApprovers = [];
    pendingAccessApprovers = basicPermissionInfo!.changeRequestedBy;
    pendingApproversRemaining = basicPermissionInfo!.changeRequestApprovalsRemaining;
  } else {
    currentAccessType = "none";
    pendingAccessType = undefined;

    currentAccessApprovers = [];
  }

  const myVote: AccessVote.T = hasApprover(adminPermissionInfo, callerAddress)
    ? "admin"
    : hasApprover(basicPermissionInfo, callerAddress)
    ? "basic"
    : "none";

  const currentAccess = {
    accessType: currentAccessType,
    approvers: currentAccessApprovers,
    decliners: currentAccessDecliners,
  };

  const dto: NodeInfoDto = {
    address: info.address,
    isConnected: info.isConnected,
    myVote,
    currentAccess,
  };

  if (
    pendingAccessType !== undefined &&
    pendingAccessApprovers !== undefined &&
    pendingApproversRemaining !== undefined
  ) {
    dto.pendingAccess = {
      accessType: pendingAccessType,
      approvers: pendingAccessApprovers,
      nWantingApprovers: pendingApproversRemaining,
    };
  }

  return dto;
}

function getPermissionInfo(
  info: Nodes.NodeInfo,
  permission: Nodes.NetworkPermission,
): Nodes.PermissionInfo | undefined {
  return info.networkPermissions.filter((x) => x.permission === permission).find((_) => true);
}

function hasApprover(
  permissionInfo: Nodes.PermissionInfo | undefined,
  maybeApprover: WalletAddress,
): boolean {
  if (permissionInfo === undefined) return false;
  return permissionInfo.approvedBy.map((x) => x.address).includes(maybeApprover);
}
