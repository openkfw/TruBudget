---
sidebar_position: 12
---

# Node Status

Date: 11/03/2021

## Status

Accepted

## Context

We want to be able to display more info regarding the status of the nodes connected to the network. A useful feature would be to display if a node is still connected or not and also to see a "last seen" timestamp of the nodes.

## Decision

In order for the connection status to be displayed, an endpoint checking the multichain's [getpeerinfo](https://www.multichain.com/developers/json-rpc-api/) function would be called. This returns the nodes connected at the moment. However, since MultiChain doesn't provide information about when a node was last seen we want to implement this feature in the api. A new stream should be created called `network_log` and every 24h an event would be saved on the stream displaying the addresses of the nodes connected at that moment. All nodes in the network perform the check but only saves it on the stream if there is no event saved for that day. This way, the check is being recorded even if one of the nodes is disconnected but it is also prevents duplicate entries.

## Consequences

The `network.list` endpoint also need to be adapted to display the information mentioned above. When nodes are listed, the field `isConnected` should also show the connection status and the `lastSeen`, which shows on what date the node was last connected.
