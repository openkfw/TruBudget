FROM nginx:alpine


COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY configureServer.sh /usr/
COPY build /usr/share/nginx/html


# Run nginx
CMD /bin/ash /usr/configureServer.sh
