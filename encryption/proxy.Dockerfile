FROM node:14.17.0

WORKDIR /home/node

COPY package*.json ./
RUN npm install

COPY src src/

CMD npm start
