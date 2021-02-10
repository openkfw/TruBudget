 #!/bin/bash

if [ ! -f .env ]; then
    cp .env_example .env
fi

if [[ $1 == "justfe" ]]; then
    echo "No containers started"
else 
    echo "Building, Starting and Provisioning TruBudget for Development"

    COMPOSE="docker-compose -f docker-compose/development/docker-compose-slim.yml -p trubudget-dev"

    $COMPOSE down

    $COMPOSE up -d --build
fi

if [[ $1 == "nofe" ]]; then
    echo "No FE started"
else 
    cd frontend

    export PORT=3000

    npm start
fi
