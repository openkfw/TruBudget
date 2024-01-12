FROM node:18-alpine

WORKDIR /home/node

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY src src/
COPY tsconfig.json .
RUN npm run build

# Use node user to execute the application. Node user is not in su list
USER node

CMD npm start
