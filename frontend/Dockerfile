FROM node:10.5-alpine as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
#RUN sed -i '/"cypress"/d' package.json
RUN npm ci

COPY . ./
RUN npm run build

######

FROM nginx:1.15-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY configureServer.sh /usr/
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

ARG BUILDTIMESTAMP=''
ARG CI_COMMIT_SHA=''

ENV BUILDTIMESTAMP ${BUILDTIMESTAMP}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}

# Run nginx
CMD /bin/ash /usr/configureServer.sh
