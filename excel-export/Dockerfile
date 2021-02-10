FROM node:13.12-alpine

WORKDIR /home/node

COPY package*.json ./
RUN npm ci

COPY src src/
COPY tsconfig.json .

RUN npm run build

CMD npm start
