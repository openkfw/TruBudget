FROM cypress/base:18.12.1

# copy test fixtures into the container
COPY package*.json ./
RUN CI=true npm ci

RUN $(npm bin)/cypress verify

COPY cypress.config.js ./
COPY cypress cypress

CMD $(npm bin)/cypress run
