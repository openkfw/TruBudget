FROM ubuntu:20.04

COPY ./../k6-tests/ /scripts
RUN apt-get update &&  apt-get install ca-certificates gnupg2 -y
RUN apt-get install curl -y
RUN curl -s https://dl.k6.io/key.gpg | apt-key add -
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
RUN echo "deb https://dl.k6.io/deb stable main" |  tee /etc/apt/sources.list.d/k6.list
RUN apt-get update
RUN apt-get install k6 -y

CMD k6 run --out prometheus  /scripts/stress.js

