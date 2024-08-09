FROM node:18-alpine as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

######

FROM nginx:1.27-alpine

ARG USE_SSL
ARG SSL_DOMAIN

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-ssl.conf /etc/nginx/conf.d/default-ssl.conf
COPY certificates/* /etc/ssl/${SSL_DOMAIN}/
COPY configureServer.sh /usr/
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}
ENV USE_SSL ${USE_SSL}
ENV SSL_DOMAIN ${SSL_DOMAIN}

# Run nginx
CMD /bin/ash /usr/configureServer.sh
