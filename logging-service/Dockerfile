FROM node:18.4.0-alpine

WORKDIR /home/node
# TODO Remove this after publishing the package
COPY trubudget-pino-logger trubudget-pino-logger
COPY server.js server.js
COPY package*.json ./

RUN npm ci

USER node

CMD npm start
