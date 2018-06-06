FROM nginx:stable

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY configureServer.sh /usr/
COPY build /usr/share/nginx/html

# Run nginx
CMD /bin/bash /usr/configureServer.sh