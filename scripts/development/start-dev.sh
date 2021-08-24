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
    echo "      --build                 Force docker-compose built"
    echo "      --no-provisioning       Do not start the provisioning"
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


# Get the absolute path of the script directory
SCRIPT_DIR=$(dirname $(readlink -f $0))
echo "INFO: Current script directory: $SCRIPT_DIR"

if [ "$IS_SLIM" = true ]; then
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


if [ "$IS_SLIM" = true ]; then
    if [ "$IS_NO_PROVISONING" = true ]; then
        echo "INFO: Setup slim TruBudget environment without provisioning ..."
        $COMPOSE up master-node master-api frontend
    else
        echo "INFO: Setup slim TruBudget environment with provisioning ..."
        $COMPOSE up master-node master-api provisioning frontend
    fi
else
    if [ "$IS_NO_PROVISONING" = true ]; then
        echo "INFO: Setup full TruBudget environment without provisioning ..."
        $COMPOSE up master-node emaildb minio master-api email-service excel-export-service storage-service frontend
    else
        echo "INFO: Setup full TruBudget environment with provisioning ..."
        $COMPOSE up
    fi
fi


