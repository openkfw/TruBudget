FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN sed -i '/"cypress"/d' package.json
RUN npm ci

COPY . ./
RUN npm run build
