FROM node:18-alpine

WORKDIR /home/node

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY src/ src/

CMD ["npm" ,"start"]

