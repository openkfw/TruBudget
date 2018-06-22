FROM node:alpine as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
RUN sed -i '/"cypress"/d' /usr/src/app/package.json
RUN while sleep 1; do cmd; done
RUN npm ci

COPY . /usr/src/app
RUN npm run build