#!/usr/bin/env bash

name="project.list"
host=localhost
port=8080
prefix=/api

base="http://${host}:${port}${prefix}"

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

plan="\
GET ${base}/project.list
Host: localhost
${auth_header}

"

# jq -ncM "{method: \"GET\", url: \"${base_url}/project.list\", header: {\"Authorization\": [\"Bearer ${token}\"]}}" \

echo "$plan" | vegeta attack -name "$name" -rate 2 -duration 60s > "${name}-results.bin"

vegeta report "${name}-results.bin"

vegeta plot <"${name}-results.bin" >"${name}-plot.html"

