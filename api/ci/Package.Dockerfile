FROM node:10.5-slim

ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}

COPY package.json /home/node/package.json
COPY package-lock.json /home/node/package-lock.json
WORKDIR /home/node
RUN npm install --production


COPY /dist /home/node/dist

CMD ["npm", "start"]
