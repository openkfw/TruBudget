#!/bin/bash

# Input paths for the .env files
ENV_FILE=".test.env"
ENV_EXAMPLE_FILE=".test.env.example"

# Check if .env.example exists
if [[ ! -f "$ENV_EXAMPLE_FILE" ]]; then
  echo "Error: $ENV_EXAMPLE_FILE not found!"
  exit 1
fi

# Backup the existing .env file if it exists
if [[ -f "$ENV_FILE" ]]; then
  cp "$ENV_FILE" "$ENV_FILE.bak"
  echo "Existing $ENV_FILE backed up as $ENV_FILE.bak"
fi

# Create or clear the new .env file
> "$ENV_FILE"

# Helper function to prompt for a yes/no response
ask_yes_no() {
  while true; do
    read -r -p "$1 (Y/n): " response
    case "$response" in
      [Yy]* ) return 0 ;;
      [Nn]* ) return 1 ;;
      * ) echo "Please answer Y or n." ;;
    esac
  done
}

# Process each module in .env.example
current_module=""
while IFS= read -r line || [[ -n "$line" ]]; do
  # Trim leading and trailing whitespace
  line=$(echo "$line" | xargs)

  # Detect module sections with "# MODULE: <module_name>"
  if [[ $line =~ ^#\ MODULE:\ (.*) ]]; then
    current_module="${BASH_REMATCH[1]}"
    
    # Ask if the user wants to configure this module
    if ask_yes_no "Would you like to configure $current_module?"; then
      echo "Configuring $current_module..."
    else
      current_module=""
    fi

  # Process variable lines if in an active module
  elif [[ -n "$current_module" && $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    # Extract the variable name
    var_name=$(echo "$line" | cut -d '=' -f 1)

    # Prompt for the value of the variable
    read -r -p "Enter value for $var_name: " var_value
    echo "$var_name=\"$var_value\"" >> "$ENV_FILE"

  # Write non-module lines directly (e.g., comments, blank lines)
  else
    echo "$line" >> "$ENV_FILE"
  fi
done < "$ENV_EXAMPLE_FILE"

echo ".env file created/updated based on $ENV_EXAMPLE_FILE."
