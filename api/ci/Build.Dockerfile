FROM node:10.5-slim as builder

WORKDIR /home/node
COPY package*.json ./
RUN npm ci
COPY src src/
COPY tsconfig.json .
RUN ["npm", "run","build"]
