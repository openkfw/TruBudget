#!/bin/bash
echo "Building and Starting TruBudget"

COMPOSE="docker-compose -f docker-compose/testing/run-all-e2e-tests.yml -p trubudget"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
