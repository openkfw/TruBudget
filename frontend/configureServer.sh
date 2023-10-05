#!/bin/bash

# Remove previous proxy pass entries
sed -i "/proxy_pass/d" /etc/nginx/conf.d/default.conf

# Set default values
api_host=localhost
api_port=8080
export_host=localhost
export_port=8888
email_host=localhost
email_port=8890
storage_service_host=localhost
storage_service_port=8090

# Check if the required env variables are set otherwise localhost will be used.

if [ -n "$API_HOST" ]; then
    api_host=$API_HOST
fi

if [ -n "$API_PORT" ]; then
    api_port=$API_PORT
fi

if [ -n "$EXPORT_HOST" ]; then
    export_host=$EXPORT_HOST
fi

if [ -n "$EXPORT_PORT" ]; then
    export_port=$EXPORT_PORT
fi

if [ -n "$EMAIL_HOST" ]; then
    email_host=$EMAIL_HOST
fi

if [ -n "$EMAIL_PORT" ]; then
    email_port=$EMAIL_PORT
fi

if [ -n "$STORAGE_SERVICE_HOST" ]; then
    storage_service_host=$STORAGE_SERVICE_HOST
fi

if [ -n "$STORAGE_SERVICE_PORT" ]; then
    storage_service_port=$STORAGE_SERVICE_PORT
fi

if [ "$USE_SSL" == "ssl" ]; then
    export DOLLAR='$'
    rm /etc/nginx/conf.d/default.conf
    envsubst < /etc/nginx/conf.d/default-ssl.conf > /etc/nginx/conf.d/default.conf
fi
rm /etc/nginx/conf.d/default-ssl.conf


# add the proxy pass and store the conf into the nginx conf directory
sed -i -e "/# pathToApi/i\\
proxy_pass http://$api_host:$api_port;" /etc/nginx/conf.d/default.conf

if [ "$REACT_APP_EXPORT_SERVICE_ENABLED" = true ]; then
    echo "Excel export has been enabled"
    echo "http://$export_host:$export_port/"
    sed -i -e "/# pathToExcelExport/i\\
    proxy_pass http://$export_host:$export_port/;" /etc/nginx/conf.d/default.conf
fi

if [ "$REACT_APP_EMAIL_SERVICE_ENABLED" = true ]; then
    echo "Email service has been enabled"
    echo "http://$email_host:$email_port/"
    sed -i -e "/# pathToEmailService/i\\
    proxy_pass http://$email_host:$email_port/;" /etc/nginx/conf.d/default.conf
fi

if [[ ! -z "${REACT_APP_EXCHANGE_RATE_URL}" ]]; then
  echo "Adding the exchange rate API url to ${REACT_APP_EXCHANGE_RATE_URL}"
  sed -i -e "/# exchangeRateApi/i\\ \   add_header Content-Security-Policy \"default-src 'self'; connect-src 'self' $REACT_APP_EXCHANGE_RATE_URL; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; child-src 'self' blob:; frame-ancestors 'self'; form-action 'self'; script-src 'self' 'unsafe-inline'; object-src 'none'; img-src 'self' data: https://validator.swagger.io;\";" /etc/nginx/conf.d/default.conf
fi


sed -i -e "/# pathToStorageService/i\\
proxy_pass http://$storage_service_host:$storage_service_port/download;" /etc/nginx/conf.d/default.conf

sed -i -e "s/^\(\s*include \/etc\/nginx\/sites-enabled\)/#&/" /etc/nginx/nginx.conf

# Save env variables into file

WWW_DIR=/usr/share/nginx/html
INJECT_FILE_PATH="${WWW_DIR}/env.js"
sed -i 's/REACT_APP_EMAIL_SERVICE_ENABLED: "false"/REACT_APP_EMAIL_SERVICE_ENABLED: "'$REACT_APP_EMAIL_SERVICE_ENABLED'"/g' ${INJECT_FILE_PATH}
sed -i 's/REACT_APP_EXPORT_SERVICE_ENABLED: "false"/REACT_APP_EXPORT_SERVICE_ENABLED: "'$REACT_APP_EXPORT_SERVICE_ENABLED'"/g' ${INJECT_FILE_PATH}

sed -i 's/REACT_APP_LOGGING: "true"/REACT_APP_LOGGING: "'$REACT_APP_LOGGING'"/g' ${INJECT_FILE_PATH}
sed -i 's/REACT_APP_LOG_LEVEL: "trace"/REACT_APP_LOG_LEVEL: "'$REACT_APP_LOG_LEVEL'"/g' ${INJECT_FILE_PATH}
sed -i 's/REACT_APP_LOGGING_SERVICE_HOST: "localhost"/REACT_APP_LOGGING_SERVICE_HOST: "'$REACT_APP_LOGGING_SERVICE_HOST'"/g' ${INJECT_FILE_PATH}
sed -i 's/REACT_APP_LOGGING_SERVICE_PORT: "3001"/REACT_APP_LOGGING_SERVICE_PORT: "'$REACT_APP_LOGGING_SERVICE_PORT'"/g' ${INJECT_FILE_PATH}
sed -i 's/REACT_APP_LOGGING_SERVICE_HOST_SSL: "false"/REACT_APP_LOGGING_SERVICE_HOST_SSL: "'$REACT_APP_LOGGING_SERVICE_HOST_SSL'"/g' ${INJECT_FILE_PATH}
sed -i 's/REACT_APP_LOGGING_PUSH_INTERVAL: "20"/REACT_APP_LOGGING_PUSH_INTERVAL: "'$REACT_APP_LOGGING_PUSH_INTERVAL'"/g' ${INJECT_FILE_PATH}
sed -i 's/REACT_APP_AUTHPROXY_ENABLED: "false"/REACT_APP_AUTHPROXY_ENABLED: "'$REACT_APP_AUTHPROXY_ENABLED'"/g' ${INJECT_FILE_PATH}
sed -i 's|REACT_APP_AUTHPROXY_URL: ""|REACT_APP_AUTHPROXY_URL: "'$REACT_APP_AUTHPROXY_URL'"|g' ${INJECT_FILE_PATH}

nginx -g "daemon off;"

