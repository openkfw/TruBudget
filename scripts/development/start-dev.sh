#!/bin/bash
# bash start-dev.sh --slim


Help()
{
    # Display Help
    echo
    echo "Help"
    echo "This script setups a TruBudget Development instance of your choice."
    echo "Frontend, API, Excel-Export, Email-Notification, Storage-Service are always hot reloaded on save."
    echo "The Multichain data is NOT persisted and will be lost after a restart."
    echo "The environmental variables are set automatically."
    echo
    echo
    echo "Syntax: bash start-dev.sh [options]"
    echo "Example: bash start-dev.sh --full --build"
    echo
    echo "options:"
    echo "      --slim                  Starts a TruBudget instance with master-node, master-api, provisioning and frontend."
    echo "      --full                  Starts a TruBudget instance with master-node, emaildb, minio, master-api, email-service,"
    echo "                              provisioning, excel-export-service, storage and frontend."
    echo "      --add-slave             Add a slave-node that trys to connect to master-node"
    echo "      --add-organization      Add a slave-node, slave-api, slave-frontend from a new Organization."
    echo "                              Needs to be approved by master-node"
    echo "      --build                 Force docker-compose build"
    echo "      --no-provisioning       Do not start the provisioning"
    echo "-h  | --help                  Print the help section"
    echo
    echo "Default option: full TruBudget instance with all services in debug mode"
    echo "Recommended docker-compose version: >1.29.2"
}

orange=`tput setaf 214`
colorReset=`tput sgr0`
SETUP_MODE="slim"
SETUP_MODE_SELECTED=false
EXTRA_SERVICES=""
HAS_SLAVE=false

echo "INFO: Building, Starting and Provisioning TruBudget for Development"

while [ "$1" != "" ]; do
    case $1 in
        --slim)
            if [ "$SETUP_MODE_SELECTED" = true ]; then echo "Either --slim or --full"; exit 1; fi;
            SETUP_MODE="slim"
            SETUP_MODE_SELECTED=true
            shift # past argument
        ;;
        
        --full)
            if [ "$SETUP_MODE_SELECTED" = true ]; then echo "Either --slim or --full"; exit 1; fi;
            SETUP_MODE="full"
            SETUP_MODE_SELECTED=true
            shift # past argument
        ;;
        
        --add-slave)
            if [ "$HAS_SLAVE" = true ]; then echo "Either --add-slave or --add-organization"; exit 1; fi;
            EXTRA_SERVICES="slave-node"
            HAS_SLAVE=true
            shift # past argument
        ;;
        
        --add-organization)
            if [ "$HAS_SLAVE" = true ]; then echo "Either --add-slave or --add-organization"; exit 1; fi;
            EXTRA_SERVICES="slave-node slave-api slave-frontend"
            HAS_SLAVE=true
            shift # past argument
        ;;
        
        --build)
            IS_BUILD=true
            shift # past argument
        ;;
        
        --no-provisioning)
            IS_NO_PROVISONING=true
            shift # past argument
        ;;
        
        -h|--help)
            Help
            exit 1
        ;;
        
        *)  # unknown option
            echo "unknown argument: " $1
            echo "Exiting ..."
            exit 1
            shift # past argument
        ;;
    esac
done


# Get the relative path of the script directory
SCRIPT_DIR=$(dirname -- $0)
echo "INFO: Current script directory: $SCRIPT_DIR"

if [ "$SETUP_MODE" = "slim" ]; then
    # Slim setup
    echo "INFO: Copy $SCRIPT_DIR/.env_example_slim to $SCRIPT_DIR/.env"
    cp $SCRIPT_DIR/.env_example_slim $SCRIPT_DIR/.env
else
    # Full setup
    echo "INFO: Copy $SCRIPT_DIR/.env_example_full to $SCRIPT_DIR/.env"
    cp $SCRIPT_DIR/.env_example_full $SCRIPT_DIR/.env
fi


COMPOSE="docker-compose -f $SCRIPT_DIR/docker-compose.yml -p trubudget-dev --env-file $SCRIPT_DIR/.env"
$COMPOSE down

if [ "$IS_BUILD" = true ]; then
    echo "INFO: Force building"
    $COMPOSE build
else
    echo "INFO: Do not build if respective image already exists"
    echo "${orange}WARNING: Changes may not be applied if the respective image already exists${colorReset}"
fi


if [ "$SETUP_MODE" = "slim" ]; then
    if [ "$IS_NO_PROVISONING" = true ]; then
        echo "INFO: Setup slim TruBudget environment without provisioning ..."
        $COMPOSE up master-node master-api frontend $EXTRA_SERVICES
    else
        echo "INFO: Setup slim TruBudget environment with provisioning ..."
        echo "bash start-dev.sh --slim"
        $COMPOSE up master-node master-api provisioning frontend $EXTRA_SERVICES
    fi
else
    if [ "$IS_NO_PROVISONING" = true ]; then
        echo "INFO: Setup full TruBudget environment without provisioning ..."
        $COMPOSE up master-node emaildb minio master-api email-service excel-export-service storage-service frontend $EXTRA_SERVICES
    else
        echo "INFO: Setup full TruBudget environment with provisioning ..."
        $COMPOSE up master-node emaildb minio master-api email-service excel-export-service storage-service provisioning frontend $EXTRA_SERVICES
    fi
fi


