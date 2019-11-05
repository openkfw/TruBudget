#!/bin/bash

echo "Building, Starting and Provisioning EEPPortal"

COMPOSE="docker-compose -f docker-compose/local/master-node.yml -f docker-compose/local/provisioning.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
