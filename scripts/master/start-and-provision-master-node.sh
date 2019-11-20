#!/bin/bash

echo "Starting and provisioning EEP-Portal"

COMPOSE="docker-compose -f docker-compose/master/master-node.yml -f docker-compose/master/provisioning.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up