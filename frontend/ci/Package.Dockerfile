FROM nginx:stable

COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY configureServer.sh /usr/


# Run nginx
CMD /bin/bash /usr/configureServer.sh