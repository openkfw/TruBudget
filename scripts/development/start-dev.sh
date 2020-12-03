 #!/bin/bash

if [ ! -f .env ]; then
    cp .env_example .env
fi

echo "Building, Starting and Provisioning TruBudget for Development"

COMPOSE="docker-compose -f docker-compose/development/docker-compose.yml -p trubudget-dev"

$COMPOSE down

$COMPOSE up -d --build