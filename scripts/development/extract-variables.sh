#!/bin/bash

# Path to the docker-compose.yml file
COMPOSE_FILE="docker-compose.yml"

# Function to parse environment variables for each service and distinguish values from environment variables
parse_services_and_environment_variables() {
    service=""
    awk '
    # Find a new service block (starts at the same indentation level as "services")
    /^[[:space:]]{2}[a-zA-Z0-9_-]+:/ {
        service=$1;
        gsub(":", "", service);
    }

    # Find the environment block for the current service
    /environment:/ {
        in_env_block=1;
        next;
    }

    # Extract key-value pairs inside the environment block
    in_env_block && /^[[:space:]]*[A-Z_]+:/ {
        gsub(/[[:space:]]*/, "", $0); # Remove spaces
        split($0, kv, ":");           # Split on ":"
        key=kv[1];                    # Key is before ":"
        value=kv[2];                  # Value is after ":"
        
        # Check if the value is a hardcoded value or an environment variable reference
        if (value ~ /^\$\{.*\}$/) {
            gsub(/[\$\{\}]/, "", value);  # Clean up variable placeholders
            print "Service: " service ", key:\"" key "\", value:\"" value "\", type:environment variable";
        } else {
            print "Service: " service ", key:\"" key "\", value:\"" value "\", type:value";
        }
    }

    # Reset in_env_block when we leave the environment block or hit a new service
    /^[[:space:]]{2}[a-zA-Z0-9_-]+:/ || /^[[:space:]]{2}$/ {
        in_env_block=0;
    }
    ' "$COMPOSE_FILE"
}

# Run the function to extract variables and service names
parse_services_and_environment_variables
