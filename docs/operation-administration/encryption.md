# Securing communication between nodes

:::tip Help wanted!

Heads up! If you have an idea how to realize this feature, feel free to [open a new GitHub Discussion](https://github.com/openkfw/TruBudget/discussions/new)

:::

As of TruBudget 1.24, the data on the chain and the data in transit are encrypt to ensure confidentiality of the data. As of now (V.1.25) neither authenticity nor integrity for data send over the P2P network can be guaranteed out-of-the-box. There are [different approaches that have been evaluated](https://github.com/openkfw/TruBudget/issues/831), but so far none of them produced the expected result. Ultimately, the usage of an VPN Mesh Network (i.e. [Nebula](https://github.com/slackhq/nebula)) is recommended. If this for some reason does not work out for your use case, we recommend using the [MultiChain Enterprise](https://www.multichain.com/enterprise/), which comes with an out-of-the-box solution for this problem.

Below, you can find the elicited approaches to establish a secure P2P connection between nodes. If you want to help us solve this problem, feel free to open a PR on [GitHub](https://github.com/openkfw/TruBudget).

## SOCKS 5 reverse proxy

MultiChain daemon has an option to communicate with nodes via a SOCKS 5 proxy.
The usage for this is:

```
multichaind [chain]@[ip-address]:[port] - daemon -proxy:[user]:[pass]@[myproxy]:[myproxyport]
```

While the SOCKS 5 protocol itself does not provide encryption, the basic idea would be to build a reverse proxy where the connections facing public networks are encrypted using TLS. This can be done by creating a TCP socket which the MultiChain instances uses as proxy destination. The incoming traffic is piped through a TLS socket to the destination proxy server. The destination Proxy server accepts the connection via a TLS socket and pipe the data to the MultiChain instance using a TCP socket.
A corresponding question in the MultiChain community can be found [here](https://www.multichain.com/qa/36704/socks-5-proxy-for-p2p-connections).

```
 | Alpha Node < --- > Proxy 1 |  < --Public Network (via SSL) --> | Proxy 2 < --- > Beta Node |
 |           Container 1       |                                   |         Container 2        |
```

## Altering Multichain

As MultiChain is an open source project, the source code can be modified to support TLS connections between the sockets processing the SOCKS 5 protocol. This would come with additional maintaining effort.
