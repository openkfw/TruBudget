#!/bin/bash
# Taken from: https://k6.io/docs/results-visualization/influxdb-+-grafana/
CURR=$PWD
git clone 'https://github.com/k6io/k6'
cd k6
docker-compose up -d \
    influxdb \
    grafana
docker-compose run -v \
    $CURR/k6-tests:/scripts \
    k6 run /scripts/stress.js
