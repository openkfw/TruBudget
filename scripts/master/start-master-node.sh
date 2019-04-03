#!/bin/bash
echo "Starting TruBudget"

COMPOSE="docker-compose -f docker-compose/master/master-node.yml -p trubudget"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up