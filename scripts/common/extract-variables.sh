#!/bin/bash

# Function to parse environment variables for each service and distinguish values from environment variables
parse_services_and_environment_variables() {
    # Path to the docker-compose.yml file
    COMPOSE_FILE=$1
    ENV_FILE=$2
    SERVICE_NAME=$3

    if [ ! -f "$COMPOSE_FILE" ]; then
      echo "Error: Dockerfile does not exist at $COMPOSE_FILE"
      exit 1  # Exit with failure status
    fi

    if [ ! -f "$ENV_FILE" ]; then
      echo "Error: Env file does not exist at $COMPOSE_FILE"
      exit 1  # Exit with failure status
    fi

    source $ENV_FILE

    service=""
    in_env_block=0

    while IFS= read -r line; do
        # Detect service block (indented with 2 spaces)
        if [[ $line =~ ^[[:space:]]{2}([a-zA-Z0-9_-]+):[[:space:]]*$ ]]; then
            service="${BASH_REMATCH[1]}"
            in_env_block=0
        fi
        
        if [[ $service != $SERVICE_NAME ]]; then
            continue
        fi

        # Detect environment block
        if [[ $line =~ [[:space:]]{4}environment:[[:space:]]*$ ]]; then
            in_env_block=1
            continue
        fi

        # Parse environment variables inside the environment block
        if [[ $in_env_block -eq 1 && $line =~ ^[[:space:]]{6}([A-Z_]+):[[:space:]]*(.+)[[:space:]]*$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"

            # Check if it's an environment variable or a hardcoded value
            if [[ $value =~ ^\$\{(.+)\}$ ]]; then
                env_var="${BASH_REMATCH[1]}"
                real_value="${!env_var}"  # Get the value of the environment variable by name

                if [[ ! -z "$real_value" ]]; then
                    if [[ "$real_value" =~ ^-?[0-9]+$ || "$real_value" == "true" || "$real_value" == "false" ]]; then
                        # Output without quotes for numeric and boolean values
                        echo "-e $key=$real_value"
                    else
                        # Output with quotes for non-numeric and non-boolean values
                        echo "-e $key='$real_value'"
                    fi
                    
                fi
            else
                if [[ "$value" =~ ^-?[0-9]+$ || "$value" == "true" || "$value" == "false" ]]; then
                    # Output without quotes for numeric and boolean values
                    echo "-e $key=$value"
                else
                    # Output with quotes for non-numeric and non-boolean values
                    echo "-e $key='$value'"
                fi
                                
            fi
        fi

        # Exit the environment block when encountering a new service or empty line
        if [[ $line =~ ^[[:space:]]{2}[a-zA-Z0-9_-]+: ]] || [[ -z $line ]]; then
            in_env_block=0
        fi
    done < "$COMPOSE_FILE"
}
