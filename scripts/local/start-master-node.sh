git pull 
docker rm $(docker ps -q -f status=exited)
docker-compose -p local -f docker/local/master-node.yml up --build
