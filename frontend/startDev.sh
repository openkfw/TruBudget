#!/bin/bash
docker rm $(docker ps -q -f status=exited)

docker-compose down
docker-compose pull
docker-compose build
docker-compose up
