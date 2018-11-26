FROM node:10.5-slim as builder

WORKDIR /home/node
COPY tsconfig.json ./
COPY package*.json ./
RUN npm ci
COPY src src/
RUN ["npm", "run","build"]
