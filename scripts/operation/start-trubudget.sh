echo "INFO: email-service enabled"
            
            elif [ "$word" = "excel-export-service" ]; then
            perl -pi -e 's/REACT_APP_EXPORT_SERVICE_ENABLED=.*/REACT_APP_EXPORT_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
            echo "INFO: excel-export-service enabled"
            
            elif [ "$word" = "storage-service" ]; then
            perl -pi -e 's/DOCUMENT_FEATURE_ENABLED=.*/DOCUMENT_FEATURE_ENABLED=true/g' ${SCRIPT_DIR}/.env
            ENABLED_SERVICES="${ENABLED_SERVICES} minio"
            echo "INFO: storage-service enabled"
            
            elif [ "$word" = "logging-service" ]; then
            perl -pi -e 's/REACT_APP_LOGGING=.*/REACT_APP_LOGGING=true/g' ${SCRIPT_DIR}/.env
            echo "INFO: logging-service enabled"
            
        else
            echo "${red}ERROR: Unknown service $word${colorReset}"
            echo "${red}Only these services can be added with --enable-service: email-service, excel-export-service, storage-service${colorReset}"
            echo "${red}Also, make sure the option --enable-service is used as last option!${colorReset}"
            exit 1
        fi
    done
fi

if [ "$IS_FULL" = true ]; then
    # Full version: enable all services
    perl -pi -e 's/EMAIL_SERVICE=.*/EMAIL_SERVICE=ENABLED/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/MULTICHAIN_FEED=.*/MULTICHAIN_FEED=ENABLED/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/REACT_APP_EMAIL_SERVICE_ENABLED=.*/REACT_APP_EMAIL_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/REACT_APP_EXPORT_SERVICE_ENABLED=.*/REACT_APP_EXPORT_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/DOCUMENT_FEATURE_ENABLED=.*/DOCUMENT_FEATURE_ENABLED=true/g' ${SCRIPT_DIR}/.env
fi

if [ "$IS_FULL" = true ]; then
    if [ "$WITH_PROVISIONING" = false ]; then
        echo "INFO: Setup full TruBudget environment without provisioning ..."
        COMPOSE_SERVICES="alpha-node emaildb minio alpha-api email-service excel-export-service storage-service frontend"
    else
        echo "INFO: Setup full TruBudget environment with provisioning ..."
        COMPOSE_SERVICES="alpha-node emaildb minio alpha-api email-service excel-export-service storage-service provisioning frontend"
    fi
else
    if [ "$WITH_PROVISIONING" = false ]; then
        # Default Setup here
        echo "INFO: Setup slim TruBudget environment without provisioning ..."
        COMPOSE_SERVICES="alpha-node alpha-api frontend"
    else
        echo "INFO: Setup slim TruBudget environment with provisioning ..."
        COMPOSE_SERVICES="alpha-node alpha-api provisioning frontend"
    fi
fi

COMPOSE="docker-compose -f $SCRIPT_DIR/docker-compose.yml -p trubudget-operation --env-file $SCRIPT_DIR/.env"
$COMPOSE down

echo "INFO: Pull images from https://hub.docker.com/ ..."
$COMPOSE pull $COMPOSE_SERVICES $ENABLED_SERVICES $BETA_SERVICES

echo "INFO: Since images are used, building is not necessary and will be skipped."
#$COMPOSE build

# Start docker containers
echo "INFO: Executing command: $COMPOSE up $LOG_OPTION $COMPOSE_SERVICES $ENABLED_SERVICES $BETA_SERVICES"
$COMPOSE up $LOG_OPTION $COMPOSE_SERVICES $ENABLED_SERVICES $BETA_SERVICES

if [ "$IS_LOG_ENABLED" = false ]; then
    echo "INFO: Docker container are started without logging"
fi
