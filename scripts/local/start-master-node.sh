#!/bin/bash
echo "Building and Starting EEP-Portal"

COMPOSE="docker-compose -f docker-compose/local/master-node.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
