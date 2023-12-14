FROM node:18.4.0-alpine

WORKDIR /home/node
COPY serve.js serve.js
COPY package.json ./
COPY package-lock.json ./

RUN npm ci

# Use node user to execute the application. Node user is not in su list
USER node

CMD npm start
