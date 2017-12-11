#!/bin/bash

sed -i "/proxy_pass/d" /usr/nginx.conf
# Check if the required env variables are set otherwise localhost will be used.
if [ "$PROD_API_HOST" ] && [ "$PROD_API_PORT" ]; then
  prod_host=$PROD_API_HOST
  prod_port=$PROD_API_PORT
else
  prod_host=localhost
  prod_port=8080
fi

if [ "$TEST_API_HOST" ] && [ "$TEST_API_PORT" ]; then
  test_host=$TEST_API_HOST
  test_port=$TEST_API_PORT
else
  test_host=localhost
  test_port=8080
fi

# add the proxy pass and store the conf into the nginx conf directory
sed -i -e "/# pathToApi/i\\
  proxy_pass http://$prod_host:$prod_port/;" /usr/nginx.conf
sed -e "/# pathToTestApi/i\\
  proxy_pass http://$test_host:$test_port/;" /usr/nginx.conf > /etc/nginx/conf.d/default.conf

rm -rf test.conf test2.conf
nginx -g "daemon off;"

