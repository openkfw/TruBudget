# Blockchain explorer

This is a simple expressJS API to fetch the streams and stream items from a multichain node.

## Getting started

## Commands in Multichain

docker exec -it e9XXXX bash

multichain-cli TrubudgetChain

liststreams

liststreamitems users

liststreamitems stream1 false 999999
liststreamitems 6acca726f8bf8994f780e80d7c50d240false 999999

https://www.multichain.com/developers/json-rpc-api/

### Environment Variables

| name | Description                     |
| ---- | ------------------------------- |
| PORT | Port of the blockchain explorer |

### Environment Variables

| Env Variable | Required | Default Value                                | Description                                                                                               |
| ------------ | -------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| PORT         | no       | 8081                                         | Port of the blockchain explorer API                                                                       |
| RPC_USER     | no       | multichainrpc                                | The user used to connect to the multichain daemon.                                                        |
| RPC_PORT     | no       | 8000                                         | Port to the Multichain RPC                                                                                |
| RPC_HOST     | no       | 127.0.0.1                                    | Host to the Multichain RPC                                                                                |
| RPC_PASSWORD | no       | s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j | Password used by the API to connect to the blockchain. The password is set by the origin node upon start. |
