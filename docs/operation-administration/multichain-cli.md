# Multichain-Cli

Besides the JSON-RPC API, multichain has a command line tool `multichain-cli`, which can be accessed inside the container in which multichain node is running.
It can be used to issue single commands or as an interactive prompt.

Go ahead and connect to a multichain container:

`docker exec -it *your_container_id* bash`

Example: `docker exec -it b68341770e68ef4be2f7ed008de35910b246bcb68a9913e85d28a6a640ebf98e bash`

Once you're in, execute `multichain-cli TrubudgetChain`, which starts an interactive session.

## Querying TruBudget multichain

Multichain streams are used as a general purpose append only database, retrievable by transaction ID (txid), name (often ID used in application) or ref. Data is stored in TruBudget as a set of defined events in the stream, retrievable by `stream` and `key` . No items in blockchain can be deleted or overwritten. It is up to the application to interpret the data it fetches from the chain. All items/transactions are timestamped, which makes the order of operations on a piece of data clear.

There are separate streams for groups, users, organizations, projects etc. You can notice that names of project streams are the IDs visible on frontend.
You can pass these to parameters of other multichain-cli commands.

For example, when the workflowitem is created, that event is stored in TruBudget stream with project ID, and subproject ID and workflowitem ID are used as keys.

- How to list streams

`liststreams`

- How to list projects

`liststreamitems` with key `details: { kind: "project" }`

- How to see information about stream

`getstreaminfo` ID/ref/creation txid

Example to get info about project stream with project ID passed as argument: `getstreaminfo fe29bc903d155f4214e50ab7189dbec9`

- How to see project details

`liststreamitems projectId` e.g. `liststreamitems fe29bc903d155f4214e50ab7189dbec9`

Observe, that we do not get complete details of a project with all subprojects and workflowitems.

- How to see subproject details

`liststreamkeyitems "projectId" "subprojectId"` (with double quotes) e.g.
`liststreamkeyitems "fe29bc903d155f4214e50ab7189dbec9" "190d7bd8409d3ca905c727b48fb28bd8"`

## Network, nodes, status

- How to get general information about the node and blockchain

`getinfo` return, among other, name of blockchain, description, node address, protocol, p2p port, number of connected peer nodes

- How to gen network multichain node is connected to

`getnetworkinfo`

- How to get information about connected nodes

`getpeerinfo` returns an array of objects representing peer connected nodes, including IP address and ping

- How to get information about all nodes in the network

This is two step-process. First list all nodes from the TruBudget `nodes` stream: `liststreamkeyitems "nodes" "*"`.
Every node has an address. We can list permissions of a particular node with `listpermissions all "1E2XKauFRbK6vhGv3iSEyobpSY7EKvK14MAyLc"`.
Alternatively, we can list all permissions of all nodes:
`listpermissions`.
Nodes that have been granted no permission to connect to the chain do not have `connect` permission. Either it has not yet been granted, or has been revoked.

## Further info

- [Read more about MultiChain Streams](https://www.multichain.com/blog/2016/09/introducing-multichain-streams/)
- [ MultiChain API documentation](https://www.multichain.com/developers/json-rpc-api/)
