# Infrastructure-Guide


When running the full setup of Trubudget following components are deployed:

| Component name | number | Description                                                                                                                                                                                                                      |
| :------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend       | 1      | Deploys the Trubudget user interface connecting to the test/prod API                                                                                                                                                             |
| API            | 2      | Deploys two APIs, each connected to their own blockchain-node (test, prod).<br>An API can be accessed through a connected frontend or                                                       directly using the API-documentation |
| Blockchain     | 2      | Deploys two blockchain nodes in their own networks, so each node uses its own multichain instance                                                                                                                                |

## Setup
The connection between previous listed components is shown in the graphic below.

![infrastructure Trubudget](../uploads/Graphics/Trubudget_infrastructure_prod_test.png)

## Adding a new blockchain-node
A new blockchain-node joins the network(a detailed explanation of how a node joins a network can be found in the adr ["multi-node-setup"](https://github.com/openkfw/TruBudget/blob/master/doc/adr/0010-multi-node-setup.md)):

![add a blockchain-node to a Trubudget network](../uploads/Graphics/Trubudget_infrastructure_add_blockchainnode.png)

## Ports

Following table is describing the ports shown in the infrastructure graphics. The components column shows which component uses the port.

| Environment variable name | Components      | Description                                    |
| :------------------------ | :-------------- | :--------------------------------------------- |
| P2P_PORT                  | blockchain      | Used for connection between blockchain nodes   |
| RPC_PORT                  | blockchain, api | Used for connection between blockchain and api |
| API_PORT                  | blockchain      | Used for connection between blockchain and api |
| PORT                      | api             | Used for connection between frontend and api   |
| PROD_API_PORT             | frontend        | Used for connection between frontend and api   |
| TEST_API_PORT             | frontent        | Used for connection between frontend and api   |
