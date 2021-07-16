FROM node:10.5-slim

# Default P2P Port:
EXPOSE 7447
# Default RPC Port:
EXPOSE 8000

RUN curl -ko- https://www.multichain.com/download/multichain-2.1.2.tar.gz | tar xzv -C /usr/local/bin --strip 1 --exclude='multichain-2.1.2/multichaind-cold'

CMD multichaind chain1@master-proxy-server:1080
