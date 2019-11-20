#!/bin/bash

echo "Building, starting and connecting to existing EEP-Portal Node"

COMPOSE="docker-compose -f docker-compose/local/slave-node.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up
