#!/bin/bash

export ORGANIZATION=ACMECorp
export ROOT_SECRET='root-secret'
export ORGANIZATION_VAULT_SECRET="secret"
export RPC_PASSWORD=s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j
export RPC_PORT=8000
export API_PORT=8080
export MASTER_API_PORT=8080

echo "Building and Starting TruBudget"

COMPOSE="docker-compose -f docker-compose/multi/multi-nodes.yml -p trubudget"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
