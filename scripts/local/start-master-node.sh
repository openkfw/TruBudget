#!/bin/bash
echo "Building and Starting EEPPortal"

COMPOSE="docker-compose -f docker-compose/local/master-node.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
