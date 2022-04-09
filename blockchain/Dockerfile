FROM node:10.5-slim

# Default P2P Port:
EXPOSE 7447
# Default RPC Port:
EXPOSE 8000

RUN curl -ko- https://www.multichain.com/download/multichain-2.1.2.tar.gz | tar xzv -C /usr/local/bin --strip 1 --exclude='multichain-2.1.2/multichaind-cold'

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

# Import Example data from TruBudget
COPY ./example_data/ /root/.multichain
# RUN chmod +x /root/.multichain


# Run Chain
CMD ["npm", "start"]
