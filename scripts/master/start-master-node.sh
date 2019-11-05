#!/bin/bash
echo "Starting TruBudget"

COMPOSE="docker-compose -f docker-compose/master/master-node.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up