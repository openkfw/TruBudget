#!/bin/bash

echo "Building and Starting E2E Tests"

docker-compose -f docker-compose/development/e2e-test.yml -p trubudget-dev up --force-recreate --build e2e-test