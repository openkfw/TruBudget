#!/bin/bash
docker-compose -f docker-compose/local/master-node.yml down 
docker rm $(docker ps -q --filter status=exited --filter label=com.docker.compose.project=trubudget)

docker-compose -p trubudget -f docker-compose/local/master-node.yml up --build
