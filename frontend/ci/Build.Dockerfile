FROM node:10.5-alpine

ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN sed -i '/"cypress"/d' package.json
RUN npm ci

COPY . ./
COPY .env_example .env
RUN npm run build
