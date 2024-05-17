#!/bin/bash

# initial creation of env files and npm installation

cd development
[[ -e .env ]] || cp .env.example .env

cd ../operation
[[ -e .env ]] || cp .env.example .env

cd ../../api
[[ -e .env ]] || cp .env.example .env
npm i

cd ../blockchain
[[ -e .env ]] || cp .env.example .env
npm i

cd ../docker-compose
[[ -e .env ]] || cp .env.example .env

cd ../e2e-test
[[ -e .env ]] || cp .env.example .env
npm i

cd ../email-notification-service
[[ -e .env ]] || cp .env.example .env
npm i

cd ../excel-export-service
[[ -e .env ]] || cp .env.example .env
npm i

cd ../frontend
[[ -e .env ]] || cp .env.example .env
npm i

cd ../frontend-collector
[[ -e .env ]] || cp .env.example .env
npm i

cd ../logging-service
[[ -e .env ]] || cp .env.example .env
npm i

cd ../migration
[[ -e .env ]] || cp .env.example .env
npm i

cd ../provisioning
[[ -e .env ]] || cp .env.example .env
npm i

cd ../storage-service
[[ -e .env ]] || cp .env.example .env
npm i

cd ..
[[ -e .env ]] || cp .env.example .env
npm i

green=`tput setaf 2`
echo "
${green}Initial configuration complete
"
