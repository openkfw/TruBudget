# Securing communication between nodes

Please take it with a grain of salt, and a healthy dose of scpeticism. I am not an expert in any of the topics discussed below. It's always possible that I configured something incorrectly.

## SOCKS proxy

MultiChain daemon has an option to connect node via proxy, which is probably SOCKS proxy. 
Bitcoin, from which Multichain is forked, uses SOCKS proxy. 
Usage is  
```
multichaind [chain]@[ip-address]:[port] - daemon -proxy:[user]:[pass]@[myproxy]:[myproxyport]
```

The most common usage scenarios are probably to give a node running on a computer with no Internet access connectivity via proxy connected to the Internet, or to connect Bitcoin node to TOR (The Onion Router).

SOCKS protocol in itself does not provide encryption. Dynamic port forwarding with SSH creates a local SOCKS proxy server. When client connects to a port associated with the SOCKS proxy, its connection is forwarded to the configured *ssh server*. It is this part of connection that is encrypted, namely from ssh client to ssh server, and back. Traffic from server to destination is, and should be, the same as before it entered proxy, which in our case is unencrypted.

Problem which arises if SOCKS proxy would be used as a solution for adding encryption on top of unsecured HTTP without VPN is the need to create a *complete digraph*, in which every multichain node is connected to every other multichain node by a bidirectional encrypted communication channel. 

If it was possible to automate creation of tunnels, it might be a viable option.


## SSH tunnel

Idea behind this is to encrypt communication by using HTTPS with digital certificates.
With one tunnel, secure connection is estabilished between two machines. For multiple machines to communicate as peers, there needs to be a tunnel between every two machines. Number of connections is thus equal to number of edges inside a complete graph. 

This is not very scalable approach, and needs to be setup by users.

## Openssh server

Reason this was investigated is, because according to Docker documentation, "running sshd inside a container is discouraged, however, it might be still useful for certain use cases such as port forwarding. See https://github.com/linuxserver/docker-openssh-server for an example of Dockerized SSH service." 
(https://docs.docker.com/engine/examples/running_ssh_service/)


## SSHUTLE 
[sshuttle](https://github.com/sshuttle/sshuttle)

This was checked mainly because a description of their project states "Transparent proxy server that works as a poor man's VPN." 
`sshuttle` might work for connecting a client machine to a remote network, but our use case was to create a "vpn" with several peer machines.

## Ghostunnel
(https://github.com/ghostunnel/ghostunnel)
Ghostunnel is a simple TLS proxy with mutual authentication support for securing non-TLS backend applications. Sounded promising, but when trying to proxy communication between two multichain nodes, server hung up instantly. 

Ultimately, creating separate secure connections between nodes and proxying traffic through them might be able to fully encrypt multichain P2P communication, but this solution is flawed 
by a need to open them, separately on each machine.

## IPTABLES + NFQUEUE

Idea here is to filter the TCP traffic going to and from a multichain node using custom `iptables` rules, intercept and modify (encrypt/decrypt) payload  using `nfqueue` library and reinject modified packets.

Manipulation of individual TCP packets requires low-level manipulation, and then it falls to programmer's shoulders to ensure packets are well formed, headers are correct, including, but not limited to, checksum, sequence numbers.

Upside of this approach is, that encrypted communication goes over HTTP with no need to configure the connection itself, users don't need to do anything besides turning it on/off.

Packet handling is OS dependent, but since Multichain node runs inside Docker container, this is not a problem.


## Modifying Multichain source code?

- C++
- complexity unknown - might be less complex than packet manipulation
- setup of development, test and build environment
- does multichain license permit it?
- need to keep maintained/updated
