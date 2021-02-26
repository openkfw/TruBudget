 #!/bin/bash

if [ ! -f .env ]; then
    cp .env_example .env
fi

if [[ $1 == "justapi" ]]; then
    echo "No containers started"
else 
    echo "Building, Starting and Provisioning TruBudget for Development"

    COMPOSE="docker-compose -f docker-compose/development/docker-compose-blockchain.yml -p trubudget-dev"

    $COMPOSE down

    $COMPOSE up -d --build
fi

if [[ $1 == "noapi" ]]; then
    echo "No API started"
else 
    cd api

    export APP_NAME=Trubudget
    export API_HOST=localhost
    export PORT=8080
    export NODE_LOCATION_LAT="30.11"
    export NODE_LOCATION_LNG="4.68"
    export NODE_COUNTRY=Brasil
    export NODE_DESCRIPTION=UmbrellaCorp
    export ORGANIZATION=KfW
    export ORGANIZATION_VAULT_SECRET=secret
    export RPC_HOST=localhost
    export ROOT_SECRET=root-secret
    export MINIO_ENDPOINT=localhost
    export MINIO_PORT=9000
    export MINIO_USE_SSL="false"
    export MINIO_ACCESS_KEY=minio
    export MINIO_SECRET_KEY=minio123

    npm run build && npm start
fi
