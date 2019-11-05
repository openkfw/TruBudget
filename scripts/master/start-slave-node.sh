#!/bin/bash

echo "Starting and connecting to existing TruBudget Node"

COMPOSE="docker-compose -f docker-compose/master/slave-node.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up