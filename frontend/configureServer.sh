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
## TODO: Remove these lines when Pipeline is configured with new API env vars
if [ -n "$PROD_API_HOST" ]; then
    api_host=$PROD_API_HOST
fi
if [ -n "$PROD_API_PORT" ]; then
    api_port=$PROD_API_PORT
fi
if [ -n "$TEST_API_HOST" ]; then
    api_host=$TEST_API_HOST
fi
if [ -n "$TEST_API_PORT" ]; then
    api_port=$TEST_API_PORT
fi
### TODO end
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
    # echo "http://$export_host:$export_port/test/"
    sed -i -e "/# pathToProdExcelExport/i\\
    proxy_pass http://$export_host:$export_port;" /etc/nginx/conf.d/default.conf
    # sed -i -e "/# pathToTestExcelExport/i\\
    # proxy_pass http://$export_host:$export_port/test/;" /etc/nginx/conf.d/default.conf
fi

if [ "$REACT_APP_EMAIL_SERVICE_ENABLED" = true ]; then
    echo "Email service has been enabled"
    echo "http://$email_host:$email_port"
    sed -i -e "/# pathToEmailService/i\\
    proxy_pass http://$email_host:$email_port;" /etc/nginx/conf.d/default.conf
fi

sed -i -e "/# pathToStorageService/i\\
proxy_pass http://$storage_service_host:$storage_service_port/download;" /etc/nginx/conf.d/default.conf

sed -i -e "s/^\(\s*include \/etc\/nginx\/sites-enabled\)/#&/" /etc/nginx/nginx.conf

# Save env variables into file

WWW_DIR=/usr/share/nginx/html
INJECT_FILE_PATH="${WWW_DIR}/env.js"
sed -i 's/REACT_APP_EMAIL_SERVICE_ENABLED: "false"/REACT_APP_EMAIL_SERVICE_ENABLED: "'$REACT_APP_EMAIL_SERVICE_ENABLED'"/g' ${INJECT_FILE_PATH}
sed -i 's/REACT_APP_EXPORT_SERVICE_ENABLED: "false"/REACT_APP_EXPORT_SERVICE_ENABLED: "'$REACT_APP_EXPORT_SERVICE_ENABLED'"/g' ${INJECT_FILE_PATH}

nginx -g "daemon off;"

