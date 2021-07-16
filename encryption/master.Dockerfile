FROM node:10.5

# Default P2P Port:
EXPOSE 7447
# Default RPC Port:
EXPOSE 8000

RUN curl -ko- https://www.multichain.com/download/multichain-2.1.2.tar.gz | tar xzv -C /usr/local/bin --strip 1 --exclude='multichain-2.1.2/multichaind-cold'

RUN multichain-util create chain1 -anyone-can-connect=true

CMD multichaind -port=7447 -proxy=172.19.0.2:1080 chain1

