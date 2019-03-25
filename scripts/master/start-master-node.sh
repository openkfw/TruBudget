#!/bin/bash

docker-compose -f docker-compose/master/master-node.yml down
docker rm $(docker ps -q --filter status=exited --filter label=com.docker.compose.project=trubudget)

docker login http://doregistry.azurecr.io -u 78de9801-4cd1-4771-b4e8-0173026a1d3a -p cc69770a-818c-4a47-bc5b-23a4380deb10

docker-compose -f docker-compose/master/master-node.yml pull
docker-compose -p trubudget -f docker-compose/master/master-node.yml up --build