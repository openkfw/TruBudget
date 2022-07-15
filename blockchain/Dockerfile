FROM node:10.5-slim

# Default P2P Port:
EXPOSE 7447
# Default RPC Port:
EXPOSE 8000

RUN curl -ko- https://www.multichain.com/download/multichain-2.1.2.tar.gz | tar xzv -C /usr/local/bin --strip 1 --exclude='multichain-2.1.2/multichaind-cold'

WORKDIR /home/node
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY src/ src/
RUN chmod +x src/multichain-feed/multichain-feed
RUN chown -R node src/multichain-feed/multichain-feed

# Since we can not move the .multichain dir to the node users home (breaking change), we have to chown the root users home.
# TODO: for version 3 - move .multichain in node home
RUN chown -R node /root
# Symlink must be created for production. Multichian wants to create a .multichain folder in node users home.
# Why? Multichain internal.
# Avoid using the node users .multichain folder use the root multichain folder instead
# TODO: remove this when moving to 3.x
RUN ln -s /root/.multichain /home/node/.multichain

# Switch to node user
USER node
ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}

# Run Chain
CMD ["npm", "start"]
