#!/bin/bash

/usr/bin/sed "/proxy_pass/d" ./nginx2.conf > ./test.conf

/usr/bin/sed -e "/# pathToApi/i\\
proxy_pass http://trubudget-api-master:8080/;" ./test.conf > ./test2.conf

/usr/bin/sed -e "/# pathToTestApi/i\\
proxy_pass http://trubudget-api-slave:8080/;" ./test2.conf > ./nginx2.conf


rm -rf test.conf test2.conf
start nginx
