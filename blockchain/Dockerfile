FROM node:10.5-slim

# Default P2P Port:
EXPOSE 7447
# Default RPC Port:
EXPOSE 8000

RUN curl -ko- https://www.multichain.com/download/multichain-2.0.1.tar.gz | tar xzv -C /usr/local/bin --strip 1 --exclude='multichain-2.0.1/multichaind-cold'

# Since we want to store private keys away from the network
#RUN rm  /usr/local/bin/multichaind-cold

WORKDIR /home/node

COPY package*.json ./

RUN npm ci

COPY src/ src/
RUN chmod +x src/multichain-feed/multichain-feed

ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}

# Run Chain
CMD ["npm", "start"]
