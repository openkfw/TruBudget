import Intent from "../../authz/intents";
import logger from "../../lib/logger";
import * as Result from "../../result";
import { MultichainClient, PeerInfo } from "../../service/Client.h";
import * as NodeDeclined from "../../service/domain/network/node_declined";
import * as NodeRegistered from "../../service/domain/network/node_registered";
import { Event } from "../../service/event";
import * as Liststreamkeyitems from "../../service/liststreamkeyitems";

const streamName = "nodes";

export type WalletAddress = string;
export type Organization = string;
export type NetworkPermission =
  | "connect"
  | "send"
  | "receive"
  | "issue"
  | "create"
  | "mine"
  | "activate"
  | "admin";

export interface AugmentedWalletAddress {
  address: WalletAddress;
  organization?: string;
}

export interface NodeInfo {
  address: AugmentedWalletAddress;
  networkPermissions: PermissionInfo[];
  isConnected?: boolean;
  declinedBy: AugmentedWalletAddress[];
}

export interface PermissionInfo {
  permission: NetworkPermission;
  isEffective: boolean;
  approvedBy: AugmentedWalletAddress[];
  changeRequestedBy: AugmentedWalletAddress[];
  changeRequestApprovalsRemaining: number;
}

export async function grant(
  multichain: MultichainClient,
  issuer: WalletAddress,
  target: WalletAddress,
  permissions: NetworkPermission[],
): Promise<void> {
  await multichain.getRpcClient().invoke("grantfrom", issuer, target, permissions.join(","));
}

export async function revoke(
  multichain: MultichainClient,
  issuer: WalletAddress,
  target: WalletAddress,
  permissions: NetworkPermission[],
): Promise<void> {
  await multichain.getRpcClient().invoke("revokefrom", issuer, target, permissions.join(","));
}

export async function publish(
  multichain: MultichainClient,
  address: WalletAddress,
  args: {
    intent: Intent;
    createdBy: string;
    creationTimestamp: Date;
    dataVersion: number; // integer
    data;
  },
): Promise<Event> {
  const { intent, data } = args;
  let event;
  if (intent === "network.registerNode") {
    event = NodeRegistered.createEvent("system", "system", data.address, data.organization);
  } else if (intent === "network.declineNode") {
    event = NodeDeclined.createEvent(
      "system",
      "system",
      data.address,
      data.organization,
      data.declinerAddress,
      data.declinerOrganization,
    );
  }

  const streamItemKey = address;
  const streamItem = { json: event };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publishEvent = (): any => {
    logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
    return multichain
      .getRpcClient()
      .invokePublish(streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch((err) => {
    if (err.code === -708) {
      // The stream does not exist yet. Create the stream and try again:
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      return multichain
        .getOrCreateStream({ kind: "nodes", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
}

/**
 * Detects if a node with the given address is currently connected to the network
 * @param address Node wallet address
 * @param publishers List of the publishers
 * @param peerInfo List of directly connected peers (nodes)
 */
function isNodeConnected(
  address: WalletAddress = "",
  publishers: string[] = [],
  peerInfo: PeerInfo[] = [],
): boolean {
  if (publishers.some((publisher) => publisher === address)) {
    return true;
  }

  return !!peerInfo.find(
    ({ handshake, handshakelocal }) => handshake === address || handshakelocal === address,
  );
}

/**
 * Gets a list with all registered nodes
 *
 * @param multichain the multichain on which the nodes were registered
 */
export async function get(multichain: MultichainClient): Promise<NodeInfo[]> {
  const streamItems: Liststreamkeyitems.Item[] = await multichain
    .v2_readStreamItems(streamName, "*")
    .catch((err) => {
      if (err.kind === "NotFound" && err.what.stream === "stream nodes") {
        // The stream does not1 exist yet, which happens on (freshly installed) systems that
        // have not seen any notifications yet.
        logger.debug(`The stream ${streamName} does not exist yet.`);
        return [];
      } else {
        logger.error({ err }, "Getting stream items failed.");
        throw err;
      }
    });

  // add peer info
  const peerInfo = await multichain.getPeerInfo();

  const nodeEventsByAddress = new Map<WalletAddress, NodeInfo>();
  const organizationsByAddress = new Map<WalletAddress, Organization>();

  for (const item of streamItems) {
    const event = item.data.json as NodeRegistered.Event | NodeDeclined.Event;

    if (item.keys.length !== 1) {
      const message = "Unexpected item key in 'nodes' stream";
      throw Error(`${message}: ${JSON.stringify(item.keys)}`);
    }
    const address = item.keys[0];
    let nodeInfo = nodeEventsByAddress.get(address);

    if (nodeInfo === undefined) {
      nodeInfo = handleCreate(event);
    }
    if (nodeInfo === undefined) {
      throw Error(`I don't know how to handle this event: ${JSON.stringify(event)}.`);
    } else {
      nodeEventsByAddress.set(address, {
        ...nodeInfo,
        isConnected: isNodeConnected(address, item.publishers, peerInfo),
      });
      //add the decliners to the nodeInfo
      if (item.data.json.type === "node_declined") {
        const declinerAddress: AugmentedWalletAddress = {
          address: item.data.json.declinerAddress,
          organization: item.data.json.declinerOrganization,
        };
        nodeInfo.declinedBy.push(declinerAddress);
      }
      const { organization } = nodeInfo.address;
      if (organization) organizationsByAddress.set(address, organization);
    }
  }
  for (const [address, info] of nodeEventsByAddress.entries()) {
    if (await multichain.isValidAddress(address)) {
      const networkPermissions = await getNetworkPermissions(
        multichain,
        address,
        organizationsByAddress,
      );
      nodeEventsByAddress.set(address, {
        ...info,
        networkPermissions,
      });
    } else {
      nodeEventsByAddress.delete(address);
    }
  }
  return [...nodeEventsByAddress.values()];
}

/**
 * Gets a node registered on the multichain
 *
 * @param multichain the multichain on which the node is registered
 * @param address the address of the node
 * @param organization if given, also checks that the organization of the node matches the address
 */
export async function getNode(
  multichain: MultichainClient,
  address: WalletAddress,
  organization?: string,
): Promise<NodeInfo | undefined> {
  const nodes = await get(multichain);
  for (const node of nodes) {
    if (
      (!organization || node.address.organization === organization) &&
      node.address.address === address
    ) {
      return node;
    }
  }
}

export async function active(multichain: MultichainClient): Promise<number> {
  const networkInfo: MultichainNetworkInfo = await multichain
    .getRpcClient()
    .invoke("getnetworkinfo");
  return networkInfo.connections;
}

function handleCreate(input): NodeInfo | undefined {
  const event = NodeRegistered.validate(input);
  if (Result.isErr(event)) {
    return undefined;
  }
  return {
    address: {
      address: event.address,
      organization: event.organization,
    },
    declinedBy: [],
    networkPermissions: [],
  };
}

interface PermissionsPendingInfo {
  startblock: number;
  endblock: number;
  // The admins that have requested or approved already:
  admins: WalletAddress[];
  // The number of admins left for the permission to become effective:
  required: number;
}

interface MultichainNetworkInfo {
  version: number;
  subversion: string;
  protocolversion: number;
  localservices: string;
  timeoffset: number;
  relayfee: number;
  connections: number;
  networks: Network[];
  localaddresses: Localaddress[];
}

interface Localaddress {
  address: string;
  port: number;
  score: number;
}

interface Network {
  name: string;
  limited: boolean;
  reachable: boolean;
  proxy: string;
}

interface MultichainPermissionsInfo {
  address: WalletAddress;
  type: NetworkPermission;
  startblock: number;
  endblock: number;
  // The admins that have requested or approved already (only set if permission is
  // effective rather than pending):
  admins: WalletAddress[];
  pending: PermissionsPendingInfo[];
}

interface MultichainGlobalPermissionsInfo extends MultichainPermissionsInfo {
  for: null;
}

export async function getNetworkPermissions(
  multichain: MultichainClient,
  address: WalletAddress,
  organizationsByAddress?: Map<WalletAddress, Organization>,
): Promise<PermissionInfo[]> {
  const augment = (addr): AugmentedWalletAddress => augmentAddress(addr, organizationsByAddress);

  const permissions: NetworkPermission[] = ["connect", "admin"];
  const isVerbose = true;
  const items: MultichainGlobalPermissionsInfo[] = await multichain
    .getRpcClient()
    .invoke("listpermissions", permissions.join(","), address, isVerbose);
  // The list comes prefiltered, but we're doing all the checks anyway:
  return (
    items
      // only those that refer to the address we're looking for:
      .filter((item) => item.address === address)
      // only consider global permissions:
      .filter((item) => item.for === null)
      // and from those only the permissions:
      .map((item) => {
        if (item.pending.length > 1) wtf(item);

        const pending = item.pending.length ? item.pending[0] : undefined;

        let approvedBy;
        if (item.admins.length) {
          approvedBy = item.admins.map(augment);
        } else {
          if (pending) approvedBy = pending.admins.map(augment);
          else {
            logger.debug("Unknown event.");
            wtf(item);
          }
        }

        const changeRequestApprovalsRemaining = pending ? pending.required : 0;

        const info: PermissionInfo = {
          permission: item.type,
          isEffective: item.admins.length > 0,
          approvedBy,
          changeRequestedBy: pending ? pending.admins.map(augment) : [],
          changeRequestApprovalsRemaining,
        };
        return info;
      })
  );
}

function augmentAddress(
  address: WalletAddress,
  organizationsByAddress?: Map<WalletAddress, Organization>,
): AugmentedWalletAddress {
  return {
    address,
    organization: organizationsByAddress ? organizationsByAddress.get(address) : undefined,
  };
}

function wtf(thing): never {
  throw Error(` 🙃 🙃 omg what is this: ${JSON.stringify(thing)}`);
}
