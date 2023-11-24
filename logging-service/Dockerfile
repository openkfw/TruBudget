FROM node:20.9.0-alpine

WORKDIR /home/node
COPY index.js index.js
COPY serve.js serve.js
COPY package.json ./
COPY package-lock.json ./

RUN npm ci

# Use node user to execute the application. Node user is not in su list
USER node

CMD npm start
