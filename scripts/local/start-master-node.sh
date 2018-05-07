#!/bin/bash
docker-compose -f docker-compose/local/master-node.yml down 
docker rm $(docker ps -f status=exited|grep local_|awk '{print $1}')

docker-compose -p local -f docker-compose/local/master-node.yml up --build
