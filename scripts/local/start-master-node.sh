#!/bin/bash
echo "Building and Starting TruBudget"

COMPOSE="docker-compose -f docker-compose/local/master-node.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
