#!/bin/bash
# bash start-dev.sh
# use vsc extension shell-format to format this file

Help() {
    # Display Help
    echo
    echo "Help"
    echo "This script setups a TruBudget Development instance of your choice."
    echo "The environmental variables can be set in the .env file."
    echo "The latest images from hub.docker.com are used in this setup (https://hub.docker.com/search?q=trubudget&type=image)."
    echo
    echo
    echo "Syntax: bash start-dev.sh [options]"
    echo "Example: bash start-dev.sh --full --prune --provision"
    echo "Example: bash start-dev.sh --slim --enable-service excel-export-service storage-service"
    echo
    echo "options:"
    echo "  --slim                          Starts a TruBudget instance with alpha-node, alpha-api, provisioning and frontend."
    echo "  --full                          Starts a TruBudget instance with alpha-node, emaildb, minio, alpha-api, email-service,"
    echo "                                  provisioning, excel-export-service, storage and frontend."
    echo "  --use-azure-storage             Use Azure blob storage (locally Azurite) instead of Min.io storage for local development."
    echo "  --no-frontend                   Disable running frontend in docker container in order to start frontend locally."
    echo "  --build                         Force building."
    echo "  --build-only [services...]      Force building only mentioned services."
    echo "  --enable-service [services...]  Starts additional services to the TruBudget instance."
    echo "                                  Available services: email-service, excel-export-service, storage-service"
    echo "  --no-log                        Disable logs of all docker-containers"
    echo "  --no-provision                  Disable the provisioning"
    echo "  --add-beta                      Add a beta-node that trys to connect to alpha-node"
    echo "  --add-organization              Add a beta-node, beta-api, beta-frontend from a new Organization."
    echo "                                  Needs to be approved by alpha-node"
    echo "  --prune                         Delete the multichain, document storage and email database (docker volume)"
    echo "  --down                          Shutdown all docker containers"
    echo "  --help                          Print the help section"
    echo
    echo "Default option: slim TruBudget instance without provisioning"
    echo "Recommended docker compose version: >2"
}

orange=$(tput setaf 214)
red=$(tput setaf 196)
colorReset=$(tput sgr0)

echo "INFO: Building, Starting TruBudget for Development"

# Set default options
# default log option has logging enabled in docker-compose
LOG_OPTION=""
IS_LOG_ENABLED=true
WITH_PROVISIONING=true
PRUNE_DATA=false
COMPOSE_SERVICES=""
ENABLED_SERVICES=""
BETA_SERVICES=""
STORAGE_PROVIDER=""
IS_FULL=false
HAS_BETA=false
IS_REBUILDING=false
IS_PARTLY_REBUILDING=false
BUILD_SERVICES=""
START_FRONTEND_IN_CONTAINER=true
IS_SKIPPING=false
SKIPPED_SERVICE=""
IS_RESTARTING_ONLY=false
RESTART_ONLY_SERVICE=""

while [ "$1" != "" ]; do
    case $1 in
    --slim)
        IS_SLIM=true
        if [ "$IS_FULL" = true ]; then
            echo "Either --slim or --full"
            exit 1
        fi
        shift # past argument
        ;;

    --slim2)
        # Same as SLim but with storage-service and minio/azure blob
        IS_SLIM=true
        HAS_ENABLED_SERVICES=true
        ENABLED_SERVICES=" storage-service"
        STORAGE_PROVIDER="minio"
        if [ "$IS_FULL" = true ]; then
            echo "Either --slim or --full"
            exit 1
        fi
        shift # past argument
        ;;

    --full)
        IS_FULL=true
        STORAGE_PROVIDER="minio"
        if [ "$IS_SLIM" = true ]; then
            echo "Either --slim or --full"
            exit 1
        fi
        shift # past argument
        ;;

    --no-log)
        # -d means the containers start in detached mode -> no logging
        LOG_OPTION="-d"
        IS_LOG_ENABLED=false
        shift # past argument
        ;;

    --use-azure-storage)
        STORAGE_PROVIDER="azure-storage"
        shift # past argument
        ;;

    --no-frontend)
        START_FRONTEND_IN_CONTAINER=false
        shift # past argument
        ;;

    --add-beta)
        if [ "$HAS_BETA" = true ]; then
            echo "Either --add-beta or --add-organization"
            exit 1
        fi
        BETA_SERVICES="${BETA_SERVICES} beta-node"
        HAS_BETA=true
        echo "INFO: beta-node enabled"
        shift # past argument
        ;;

    --add-organization)
        if [ "$HAS_BETA" = true ]; then
            echo "Either --add-beta or --add-organization"
            exit 1
        fi
        BETA_SERVICES="${BETA_SERVICES} beta-node beta-api beta-frontend"
        echo "INFO: beta-node, beta-api, beta-frontend enabled"
        HAS_BETA=true
        shift # past argument
        ;;

    --no-provision)
        WITH_PROVISIONING=false
        shift # past argument
        ;;

    --provision)
        WITH_PROVISIONING=true
        shift # past argument
        ;;

    --build)
        IS_REBUILDING=true
        shift # past argument
        ;;

    --down)
        docker compose -p trubudget-dev down
        exit 1
        ;;

    --prune)
        PRUNE_DATA=true
        shift # past argument
        ;;

    -h | --help)
        Help
        exit 1
        ;;

    --build-only)
        if [ "$IS_REBUILDING" = true ]; then
            echo "You already enabled building of all services by using --build! Exiting ..."
            exit 1
        fi
        IS_PARTLY_REBUILDING=true
        shift # past argument --build-only
        # --build-only must be the last argument if used
        # save all words right from option --build-only
        BUILD_SERVICES=$@
        break
        ;;

    --skip)
        IS_SKIPPING=true
        shift # past argument --skip
        # --skip must be the last argument if used
        # save all words right from option --skip
        SKIPPED_SERVICE=$@
        break
        ;;

    --restart-only)
        IS_RESTARTING_ONLY=true
        shift # past argument --start-only
        # --start-only must be the last argument if used
        # save all words right from option --start-only
        LOG_OPTION="--no-deps"
        IS_PARTLY_REBUILDING=true
        RESTART_ONLY_SERVICE=$@
        BUILD_SERVICES=$RESTART_ONLY_SERVICE
        COMPOSE_SERVICES=$RESTART_ONLY_SERVICE
        ENABLED_SERVICES=""
        BETA_SERVICES=""
        break
        ;;

    --enable-service)
        if [ "$IS_FULL" = true ]; then
            echo "You already enabled all services by using --full! Exiting ..."
            exit 1
        fi
        HAS_ENABLED_SERVICES=true
        shift # past argument --enable-service
        # --enable-service must be the last argument if used
        # save all words right from option --enable-service
        ENABLED_SERVICES=$@
        break
        ;;

    --with-frontend-logging)
        HAS_ENABLED_SERVICES=true
        ENABLED_SERVICES="${ENABLED_SERVICES} frontend-collector"
        shift # past argument
        ;;

    *) # unknown option
        echo "unknown argument: " $1
        echo "Exiting ..."
        exit 1
        shift # past argument
        ;;
    esac
done

# Update browser list for Frontend
#npx browserslist@latest --update-db

if [ "$PRUNE_DATA" = true ]; then
    echo -n "${orange}WARNING: Do you really want to prune the data of multichain, minio/azure blob and emailDB? This cannot be undone! (y/N)${colorReset}"
    read answer
    if [ "$answer" = "yes" ] || [ "$answer" = "Y" ] || [ "$answer" = "y" ]; then
        sudo rm -r /alphaVolume
        sudo rm -r /beta1Volume
        sudo rm -r /minioVolume
        sudo rm -r /azureBlobVolume
        sudo rm -r /emaildbVolume
    else
        echo "INFO: Nothing deleted, script will exit ..."
        exit 1
    fi
fi

# Get the relative path of the script directory
SCRIPT_DIR=$(dirname -- $0)
echo "INFO: Current script directory: $SCRIPT_DIR"

npm config set registry https://registry.npmjs.org/

# Check if .env file exists in script directory
if [ ! -f ${SCRIPT_DIR}/.env ]; then
    echo "${orange}WARNING: .env file not found in current directory: ${SCRIPT_DIR}${colorReset}"
    echo -n "${orange}WARNING: Do you want to create .env and copy the .env_example file to .env now? (y/N)${colorReset}"
    read answer
    if [ "$answer" = "yes" ] || [ "$answer" = "Y" ] || [ "$answer" = "y" ]; then
        cp ${SCRIPT_DIR}/.env_example ${SCRIPT_DIR}/.env
    else
        echo "${red}ERROR: No .env file in directory ${SCRIPT_DIR} found, script will exit ... ${colorReset}"
        exit 1
    fi
fi

# Set service enabling/disabling env vars

if [ "$IS_FULL" = false ]; then
    # Slim version without --enable-service option: disable all services
    perl -pi -e 's/EMAIL_SERVICE_ENABLED=.*/EMAIL_SERVICE_ENABLED=false/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/MULTICHAIN_FEED_ENABLED=.*/MULTICHAIN_FEED_ENABLED=false/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/REACT_APP_EMAIL_SERVICE_ENABLED=.*/REACT_APP_EMAIL_SERVICE_ENABLED=false/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/REACT_APP_EXPORT_SERVICE_ENABLED=.*/REACT_APP_EXPORT_SERVICE_ENABLED=false/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/DOCUMENT_FEATURE_ENABLED=.*/DOCUMENT_FEATURE_ENABLED=false/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/REACT_APP_LOGGING=.*/REACT_APP_LOGGING=false/g' ${SCRIPT_DIR}/.env
fi

if [ "$HAS_ENABLED_SERVICES" = true ]; then
    # Add services to slim version
    selectedServices=$(echo $ENABLED_SERVICES | awk -F ' ' '{ s = $1; for (i = 2; i <= NF; i++) s = s "\n"$i; print s; }')
    # perl command syntax:  perl -pi -e 's/regexToReplace/SomethingToPutInInstead/g' /Some/Path/To/File.txt
    for word in ${selectedServices}; do
        if [ "$word" = "email-service" ]; then
            # Enable Services
            perl -pi -e 's/EMAIL_SERVICE_ENABLED=.*/EMAIL_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
            perl -pi -e 's/MULTICHAIN_FEED_ENABLED=.*/MULTICHAIN_FEED_ENABLED=false/g' ${SCRIPT_DIR}/.env # Disable multichain feed, not working on ARM processors; todo switch according to architecture (ex. uname -m command in bash)
            perl -pi -e 's/REACT_APP_EMAIL_SERVICE_ENABLED=.*/REACT_APP_EMAIL_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
            ENABLED_SERVICES="${ENABLED_SERVICES} emaildb"
            echo "INFO: email-service enabled"

        elif [ "$word" = "excel-export-service" ]; then
            perl -pi -e 's/REACT_APP_EXPORT_SERVICE_ENABLED=.*/REACT_APP_EXPORT_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
            echo "INFO: excel-export-service enabled"

        elif [ "$word" = "storage-service" ]; then
            perl -pi -e 's/DOCUMENT_FEATURE_ENABLED=.*/DOCUMENT_FEATURE_ENABLED=true/g' ${SCRIPT_DIR}/.env
            ENABLED_SERVICES="${ENABLED_SERVICES} ${STORAGE_PROVIDER}"
            echo "INFO: storage-service enabled"

        elif [ "$word" = "frontend-collector" ]; then
            perl -pi -e 's/REACT_APP_LOGGING=.*/REACT_APP_LOGGING=true/g' ${SCRIPT_DIR}/.env
            echo "INFO: frontend-collector enabled"

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
    perl -pi -e 's/EMAIL_SERVICE_ENABLED=.*/EMAIL_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/MULTICHAIN_FEED_ENABLED=.*/MULTICHAIN_FEED_ENABLED=true/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/REACT_APP_EMAIL_SERVICE_ENABLED=.*/REACT_APP_EMAIL_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/REACT_APP_EXPORT_SERVICE_ENABLED=.*/REACT_APP_EXPORT_SERVICE_ENABLED=true/g' ${SCRIPT_DIR}/.env
    perl -pi -e 's/DOCUMENT_FEATURE_ENABLED=.*/DOCUMENT_FEATURE_ENABLED=true/g' ${SCRIPT_DIR}/.env
fi

if [ "$IS_FULL" = true ]; then
    if [ "$WITH_PROVISIONING" = false ]; then
        echo "INFO: Setup full TruBudget environment without provisioning ..."
        COMPOSE_SERVICES="alpha-node emaildb ${STORAGE_PROVIDER} alpha-api email-service excel-export-service storage-service frontend"
    else
        echo "INFO: Setup full TruBudget environment with provisioning ..."
        COMPOSE_SERVICES="alpha-node emaildb ${STORAGE_PROVIDER} alpha-api email-service excel-export-service storage-service provisioning frontend"
    fi
else
    if [ "$WITH_PROVISIONING" = false ]; then
        # Default Setup here
        echo "INFO: Setup slim TruBudget environment without provisioning ..."
        COMPOSE_SERVICES="alpha-node alpha-api"
        if [ "$START_FRONTEND_IN_CONTAINER" = true ]; then
            COMPOSE_SERVICES="$COMPOSE_SERVICES frontend"
        fi
    else
        echo "INFO: Setup slim TruBudget environment with provisioning ..."
        COMPOSE_SERVICES="alpha-node alpha-api provisioning"
        if [ "$START_FRONTEND_IN_CONTAINER" = true ]; then
            COMPOSE_SERVICES="$COMPOSE_SERVICES frontend"
        fi
    fi
fi

# Remove skipped service
if [ "$IS_SKIPPING" = true ]; then
  COMPOSE_SERVICES=${COMPOSE_SERVICES/"$SKIPPED_SERVICE "/}
fi

# Start only selected service/s
if [ "$IS_RESTARTING_ONLY" = true ]; then
  COMPOSE_SERVICES=$RESTART_ONLY_SERVICE
fi

# Check if the docker-compose command exists. Newer Docker versions come with compose command along the docker. (docker compose)
if type -t docker-compose>/dev/null; then
  COMPOSE_COMMAND="docker-compose"
else
  COMPOSE_COMMAND="docker compose"
fi

COMPOSE="$COMPOSE_COMMAND -f $SCRIPT_DIR/docker-compose.yml"
# add additional docker-compose file in case we want to add a storage provider
if [[ $COMPOSE_SERVICES =~ "minio" || $COMPOSE_SERVICES =~ "azure-storage" ]]; then
  if [ "$STORAGE_PROVIDER" = "minio" ]; then
    COMPOSE="$COMPOSE -f $SCRIPT_DIR/docker-compose.minio.yml"
  elif [ "$STORAGE_PROVIDER" = "azure-storage" ]; then
    COMPOSE="$COMPOSE -f $SCRIPT_DIR/docker-compose.azure-storage.yml"
  fi
fi
COMPOSE="$COMPOSE -p trubudget-dev --env-file $SCRIPT_DIR/.env"

if [ "$IS_RESTARTING_ONLY" = false ]; then
  $COMPOSE down
fi

echo "INFO: Pull images from https://hub.docker.com/ ..."
$COMPOSE pull $COMPOSE_SERVICES $ENABLED_SERVICES $BETA_SERVICES

if [ "$IS_REBUILDING" = true ]; then
    echo "INFO: Re-build all selected images"
    $COMPOSE build $COMPOSE_SERVICES $ENABLED_SERVICES $BETA_SERVICES
fi

if [ "$IS_PARTLY_REBUILDING" = true ]; then
    echo "INFO: Re-build only selected images"
    $COMPOSE build $BUILD_SERVICES
fi

if [ "$IS_LOG_ENABLED" = false ]; then
    echo "INFO: Docker container are started without logging"
fi

if [ "$START_FRONTEND_IN_CONTAINER" = false ]; then
    echo "INFO: Docker container are started without frontend. You have to start it in separate window."
fi

# Start docker containers
echo "INFO: Executing command: $COMPOSE up $LOG_OPTION $COMPOSE_SERVICES $ENABLED_SERVICES $BETA_SERVICES"
$COMPOSE up $LOG_OPTION $COMPOSE_SERVICES $ENABLED_SERVICES $BETA_SERVICES

