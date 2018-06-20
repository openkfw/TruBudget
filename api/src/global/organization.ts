import { MultichainClient } from "../multichain/Client.h";
import { Organization, WalletAddress } from "../network/model/Nodes";

const maxStreamNameBytes = 16;

interface GetaddressesItem {
  address: string;
  ismine: boolean;
  iswatchonly: boolean;
  isscript: boolean;
  pubkey: string;
  iscompressed: boolean;
  account: string;
  synchronized: boolean;
}

export async function ensureOrganizationStreams(
  multichain: MultichainClient,
  organization: Organization,
): Promise<void> {
  await multichain.getOrCreateStream({
    kind: "organization",
    name: getOrganizationStreamName(organization),
  });

  await ensureOrganizationAddress(multichain, organization);

  await multichain.getOrCreateStream({
    kind: "users",
    name: getUsersStreamName(organization),
  });
}

export function getOrganizationStreamName(organization: Organization): string {
  return getStreamName(organization, "org");
}

export function getUsersStreamName(organization: Organization): string {
  return getStreamName(organization, "users");
}

function getStreamName(organization: Organization, prefix: string): string {
  let name = `${prefix}:${organization}`.replace(/ /g, "_").substring(0, maxStreamNameBytes);
  while (Buffer.byteLength(name) > maxStreamNameBytes) {
    name = name.substring(0, name.length - 1);
  }
  return name;
}

async function ensureOrganizationAddress(
  multichain: MultichainClient,
  organization: Organization,
): Promise<void> {
  const addressFromStream = await getOrganizationAddress(multichain, organization);
  if (addressFromStream) {
    // The organization already has its address set -> no need to use the local wallet
    // address.
    console.log(`Existing organization address found: ${addressFromStream}`);
    return;
  }

  // Find the local wallet address and use it as the organization address:
  const addressFromWallet = await multichain
    .getRpcClient()
    .invoke("getaddresses", true)
    .then(addressInfos =>
      addressInfos
        .filter((info: GetaddressesItem) => info.ismine)
        .map((info: GetaddressesItem) => info.address)
        .find(_ => true),
    );
  if (!addressFromWallet) throw Error("Could not obtain wallet address!");

  console.log(`Initializing organization address to local wallet address: ${addressFromWallet}`);
  const streamName = getOrganizationStreamName(organization);
  const streamItemKey = "address";
  const streamItem = { json: { address: addressFromWallet } };
  console.log(`Publishing wallet address to ${streamName}/${JSON.stringify(streamItemKey)}`);
  await multichain.getRpcClient().invoke("publish", streamName, streamItemKey, streamItem);
}

export async function getOrganizationAddress(
  multichain: MultichainClient,
  organization: Organization,
): Promise<WalletAddress | undefined> {
  const streamName = getOrganizationStreamName(organization);
  const streamItem = "address";
  const item = await multichain
    .v2_readStreamItems(streamName, streamItem, 1)
    .then(items => items.find(_ => true));
  if (!item) return undefined;
  const address: WalletAddress = item.data.json.address;
  return address;
}
