FROM cypress/base:latest

# copy test fixtures into the container
COPY package*.json ./
RUN CI=true npm ci

RUN npm run cypress-verify

COPY cypress.config.js ./
COPY cypress cypress

CMD npm run e2etest
