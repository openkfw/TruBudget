#!/bin/bash

echo "Starting and provisioning TruBudget"

COMPOSE="docker-compose -f docker-compose/master/master-node.yml -f docker-compose/master/provisioning.yml -p trubudget"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up