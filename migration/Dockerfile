FROM node:18.4.0-alpine

WORKDIR /home/node

COPY package*.json ./
RUN npm ci

COPY src/ src/
COPY tsconfig.json .
RUN npm run build

CMD ["npm" ,"start"]