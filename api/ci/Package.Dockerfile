FROM node:10.5-slim


RUN pwd

COPY package.json /home/node/package.json
COPY package-lock.json /home/node/package-lock.json
WORKDIR /home/node
RUN npm install --production


COPY /dist /home/node/dist

CMD ["node", "dist/"]
