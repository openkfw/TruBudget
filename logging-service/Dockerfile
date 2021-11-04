FROM node:13.12-alpine

WORKDIR /home/node
COPY index.js index.js
COPY serve.js serve.js
COPY package*.json ./


RUN npm ci

CMD npm start
