FROM golang:latest

COPY ./../k6-tests/ /scripts

RUN go install github.com/k6io/xk6/cmd/xk6@latest
RUN xk6 build --with github.com/szkiba/xk6-prometheus@latest
CMD ./k6 run --out prometheus  /scripts/stress.js
