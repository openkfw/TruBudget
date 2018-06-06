FROM node:latest as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN sed -i '/"cypress"/d' /usr/src/app/package.json
RUN npm install

COPY . /usr/src/app
RUN npm run build