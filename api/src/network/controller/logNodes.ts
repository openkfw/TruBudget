import logger from "lib/logger";
import { MultichainClient } from "../../service/Client.h";
import { WalletAddress } from "../../network/model/Nodes";
import * as NodesLogged from "../../service/domain/network/nodes_logged";

const NETWORK_LOG = "network_log";

export const getLatestDateOnlineByAddress = async (
  multichainClient: MultichainClient,
  address: WalletAddress,
) => {
  const [latestEntry]: any = await multichainClient
    .getRpcClient()
    .invoke("liststreamkeyitems", NETWORK_LOG, address, false, 1);
  if (latestEntry) {
    return latestEntry.data.json.date;
  }
};

export async function checkNodes(multichain: MultichainClient): Promise<any> {
  await multichain.getOrCreateStream({ kind: NETWORK_LOG, name: NETWORK_LOG });
  // current global date in YYYYMMDD format
  const date: string = new Date().toISOString().slice(0, 10);

  // Check if the event for that day is written in the stream
  // do nothing when there is an entry for current date
  const historicPeerInfo = await getPeerInfoByDate(multichain, date);
  if (historicPeerInfo.length > 0) {
    return;
  }

  // if there is no record for current date, proceed
  const [peerInfo, localAddress] = await Promise.all([
    multichain.getPeerInfo(),
    getSelfAddress(multichain),
  ]);
  const nodeAddresses: WalletAddress[] = peerInfo.map((peer) => peer.handshake);

  // Create an event
  const peerInfoSavedEvent = NodesLogged.createEvent("peerinfo_saved", date, peerInfo);

  publishEvent(multichain, {
    stream: NETWORK_LOG,
    keys: [...nodeAddresses, localAddress, date],
    event: peerInfoSavedEvent,
  });
}

const publishEvent = (multichain: MultichainClient, { stream, keys, event }: any) => {
  const streamItem = { json: event };
  return multichain
    .getRpcClient()
    .invokePublish(stream, keys, streamItem)
    .then(() => event)
    .catch((err) => {
      logger.error(err);
    });
};

const getSelfAddress = async (multichain: MultichainClient) => {
  const addressList = await multichain.getRpcClient().invoke("listaddresses");
  const [myAddress] = addressList.filter((a) => a.ismine).map((o) => o.address);
  return myAddress;
};

const getPeerInfoByDate = async (multichain: MultichainClient, date: string) => {
  const peerInfo = await multichain
    .getRpcClient()
    .invoke("liststreamkeyitems", NETWORK_LOG, date, false, 1);
  return peerInfo;
};
