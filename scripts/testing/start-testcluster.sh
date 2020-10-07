#!/bin/bash
echo "Building and Starting TruBudget"

COMPOSE="docker-compose -f docker-compose/testing/testcluster.yml -p trubudget"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
