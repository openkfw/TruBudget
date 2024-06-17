FROM node:18-alpine

WORKDIR /home/node

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY src src/
COPY tsconfig.json .

RUN npm run build

# Change ownership to node user
RUN chown -R node:node /home/node
# Switch to node user
USER node

CMD npm start
