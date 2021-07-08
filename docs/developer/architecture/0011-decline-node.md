---
sidebar_position: 11
---

# Decline Node Request

Date: 11/03/2021

## Status

Accepted

## Context

We want to be able to decline node requests. The current api logic saves an event on the `nodes` stream for all nodes registered on the network. These nodes appear in the ui's nodes table as requests. So far, the requests that were not accepted would pile up and could not be deleted. When accepted, the nodes receive permissions from the MultiChain and can successfully connect to the system. Basic nodes receive the connect, send, receive, issue and create permissions, and admin nodes also have the mine, activate and admin permissions. For more details on these permissions check out the [Multichain permissions management](https://www.multichain.com/developers/permissions-management/) documentation. The opposite of the approval of nodes (which is actually a granting of permissions) would be to revoke these permissions. However, this would not lead to the desired outcome because the nodes would again appear in the list of requests as trying to connect to the network.

## Decision

As MultiChain doesn't offer a possibility to decline nodes, we want to save an event on the `nodes` stream that mentions that a node was declined and by what organization. This way, when listing the nodes, the ones that appear in the stream as declined will be hidden from all nodes belonging to the decliner organization.

In order to promote transparency, every node in the network should see if a node has been declined by another orga.

## Consequences

A new endpoint `/network.declineNode` will be created that sends the request to decline a node. Apart from the `node.registered` event a new type of event can now be saved on the `nodes` stream `node.declined`. When calling the `/network.list`endpoint, an additional field `decliners` should be used to list the decliners of each node.
