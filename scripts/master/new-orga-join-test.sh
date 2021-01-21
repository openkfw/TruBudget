#!/bin/bash

echo "Starting and provisioning TruBudget"

COMPOSE="docker-compose -f docker-compose/master/new-orga-join-test.yml -p trubudget"
# with provisioning, and you have to change links: -testapi to -api in provisioning.yml
# COMPOSE="docker-compose -f docker-compose/master/new-orga-join-test.yml -f docker-compose/master/provisioning.yml -p trubudget"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up --remove-orphans