#!/bin/bash

echo "Building, Starting and Provisioning TruBudget"

COMPOSE="docker-compose -f docker-compose/local/master-node.yml -f docker-compose/local/provisioning.yml -p trubudget"

$COMPOSE down
docker rm $(docker ps -q --filter status=exited --filter label=com.docker.compose.project=trubudget)

$COMPOSE build --pull
$COMPOSE up
