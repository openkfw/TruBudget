#!/bin/bash
# export COMPOSE_HTTP_TIMEOUT=300
# sh scripts/development/start-dev.sh


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
    echo "Hint: Make sure you are in the root directory of TruBudget."
    echo
    echo "Syntax: sh scripts/development/start-dev.sh [options]"
    echo "Example: sh scripts/development/start-dev.sh --full --build"
    echo
    echo "options:"
    echo "      --slim                  Starts a TruBudget instance with master-node, master-api, provisioning and frontend."
    echo "      --full                  Starts a TruBudget instance with master-node, emaildb, minio, master-api, email-service,"
    echo "                              provisioning, excel-export-service, storage and frontend."
    echo "      --build                 Force docker-compose built"
    echo "-h  | --help                  Print the help section"
    echo
    echo "Default option: full TruBudget instance with all services in debug mode"
    echo "Recommended docker-compose version: >1.29.2"
}

orange=`tput setaf 214`
colorReset=`tput sgr0`

echo "INFO: Building, Starting and Provisioning TruBudget for Development"

while [ "$1" != "" ]; do
    case $1 in
        --slim)
            IS_SLIM=true
            if [ "$IS_FULL" = true ]; then echo "Either --slim or --full"; exit 1; fi;
            shift # past argument
        ;;
        
        --full)
            IS_FULL=true
            if [ "$IS_SLIM" = true ]; then echo "Either --slim or --full"; exit 1; fi;
            shift # past argument
        ;;
        
        --build)
            IS_BUILD=true
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


CURRENT_DIR=$(pwd)
echo "INFO: Current working directory: $CURRENT_DIR"

if [ "$IS_SLIM" = true ]; then
    echo "INFO: Copy $CURRENT_DIR/scripts/development/.env_example_slim to $CURRENT_DIR/.env"
    cp $CURRENT_DIR/scripts/development/.env_example_slim $CURRENT_DIR/.env
else
    # Full setup
    echo "INFO: Copy $CURRENT_DIR/scripts/development/.env_example_full to $CURRENT_DIR/.env"
    cp $CURRENT_DIR/scripts/development/.env_example_full $CURRENT_DIR/.env
fi


COMPOSE="docker-compose -f docker-compose/development/docker-compose.yml -p trubudget-dev --env-file $CURRENT_DIR/.env"
$COMPOSE down

if [ "$IS_BUILD" = true ]; then
    echo "INFO: Force building"
    $COMPOSE build
else
    echo "INFO: Do not build if respective image already exists"
    echo "${orange}WARNING: Changes may not be applied if the respective image already exists${colorReset}"
fi


if [ "$IS_SLIM" = true ]; then
    echo "INFO: Setup slim TruBudget environment ..."
    $COMPOSE up  --no-deps master-node master-api provisioning frontend
    
else
    echo "INFO: Setup full TruBudget environment ..."
    # Start all services
    $COMPOSE up
fi


