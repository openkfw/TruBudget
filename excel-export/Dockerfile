FROM node:alpine

WORKDIR /home/node

COPY package*.json ./
RUN npm ci

COPY src src/
COPY tsconfig.json .

RUN npm run build

CMD npm start
