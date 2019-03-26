FROM cypress/base:10

# copy test fixtures into the container
COPY package*.json ./
RUN CI=true npm ci

RUN $(npm bin)/cypress verify

COPY cypress.json ./
COPY cypress cypress

CMD $(npm bin)/cypress run
