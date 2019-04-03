#!/bin/bash

echo "Building, Starting and Provisioning TruBudget"

COMPOSE="docker-compose -f docker-compose/local/master-node.yml -f docker-compose/local/provisioning.yml -p trubudget"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
