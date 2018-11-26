FROM node:10.5-slim

COPY dist /home/node/dist
COPY package.json /home/node/package.json
COPY package-lock.json /home/node/package-lock.json

WORKDIR /home/node

RUN npm install --production
CMD ["node", "dist/"]
