FROM node:18-slim

WORKDIR /home/node

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY src src/
COPY trubudget-config trubudget-config/
COPY tsconfig.json .
RUN npm run build

ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}


# Give users permission to read and execute files
# Only root is the owner and has write permissions
RUN chmod -R u+rx /home/node
# Switch from root to normal user (this is a security best practice)
USER node

CMD npm start
