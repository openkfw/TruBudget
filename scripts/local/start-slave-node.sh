git pull 
docker rm $(docker ps -q -f status=exited)
docker-compose -p local -f docker/local/slave-node.yml up --build
