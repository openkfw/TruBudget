FROM nginx:stable

COPY build /usr/share/nginx/html
COPY nginx.conf /usr/
COPY configureServer.sh /usr/

# Run nginx
CMD /bin/bash /usr/configureServer.sh

