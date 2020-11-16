FROM node:12-slim

WORKDIR /home/node

COPY package*.json ./
RUN apt-get -y update && apt-get -y install libtool autoconf automake
RUN npm ci

COPY src src/
COPY tsconfig.json .

RUN npm run build

ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}

CMD npm start
