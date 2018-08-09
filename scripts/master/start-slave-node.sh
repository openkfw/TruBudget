#!/bin/bash
docker-compose -f docker-compose/master/slave-node.yml down 
docker rm $(docker ps -q --filter status=exited --filter label=com.docker.compose.project=trubudget)

echo "Login to Docker-Registry(index.docker.io)"
cat DOCKER_REGISTRY_PASSWORD | docker login --username $DOCKER_USERNAME --password-stdin index.docker.io

docker-compose -f docker-compose/master/slave-node.yml pull 
docker-compose -p trubudget -f docker-compose/master/slave-node.yml up --build