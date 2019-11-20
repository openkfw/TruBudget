#!/bin/bash
echo "Starting EEP-Portal"

COMPOSE="docker-compose -f docker-compose/master/master-node.yml -p eep-portal"

$COMPOSE down
$COMPOSE build --pull
$COMPOSE up