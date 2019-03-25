#!/bin/bash

docker-compose -f docker-compose/master/master-node.yml down
docker rm $(docker ps -q --filter status=exited --filter label=com.docker.compose.project=trubudget)

docker-compose -f docker-compose/master/master-node.yml pull
docker-compose -p trubudget -f docker-compose/master/master-node.yml up --build