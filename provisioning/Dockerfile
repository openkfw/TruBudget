FROM node:10.5-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY src/ src/

CMD ["npm" ,"start"]

