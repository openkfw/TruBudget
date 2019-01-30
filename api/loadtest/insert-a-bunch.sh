#!/usr/bin/env bash

host=localhost
port=8080
prefix=/api

base="${host}:${port}${prefix}"

token="$(echo '
{
  "apiVersion": "1.0",
  "data": {
    "user": {
      "id": "mstein",
      "password": "test"
    }
  }
}
' | http post "${base}/user.authenticate" | jq -r '.data.user.token')"

auth_header="Authorization:Bearer ${token}"

function createProject() {
    id="$(LC_CTYPE=C tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 32)"
    
    echo "Creating project ${id}"
    
    echo "
    {
      \"apiVersion\": \"1.0\",
      \"data\": {
        \"project\": {
          \"id\": \"${id}\",
          \"displayName\": \"dummy\",
          \"description\": \"dummy\",
          \"amount\": \"1\",
          \"assignee\": \"mstein\",
          \"currency\": \"EUR\",
          \"thumbnail\": \"\"
        }
      }
    }
    " | http post "${base}/global.createProject" "${auth_header}" | jq '.'
}

for i in `seq 1 1000`; do
    createProject
done
