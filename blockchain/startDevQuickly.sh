#!/bin/bash
#docker rm $(docker ps -q -f status=exited)

#echo "Login to Docker-Registry(index.docker.io)"
#cat DOCKER_REGISTRY_PASSWORD | docker login --username $DOCKER_USERNAME --password-stdin index.docker.io

docker-compose down
#docker-compose pull
#docker-compose build
docker-compose up
