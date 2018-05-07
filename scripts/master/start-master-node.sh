#!/bin/bash

docker-compose -f docker-compose/master/master-node.yml down 
docker rm $(docker ps -f status=exited|grep master_|awk '{print $1}')

echo "Login to Docker-Registry(index.docker.io)"
cat DOCKER_REGISTRY_PASSWORD | docker login --username $DOCKER_USERNAME --password-stdin index.docker.io

docker-compose -f docker-compose/master/master-node.yml pull 
docker-compose -p master -f docker-compose/master/master-node.yml up --build