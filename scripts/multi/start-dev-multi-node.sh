#!/bin/bash

if [ ! -f .env ]; then
cp .env_example .env
fi

echo "Building, Starting and Provisioning TruBudget for Development"

COMPOSE="docker-compose -f docker-compose/multi/docker-compose-multi-node.yml -p trubudget-dev-multi-node"

$COMPOSE down

$COMPOSE up -d --build
