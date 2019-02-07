FROM node:10.5-slim

COPY package.json /home/node/package.json
COPY package-lock.json /home/node/package-lock.json
WORKDIR /home/node
RUN npm install --production

COPY /dist /home/node/dist

ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}

CMD ["npm", "start"]
