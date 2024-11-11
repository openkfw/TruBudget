#!/bin/bash

# Input paths for the .env files
ENV_FILE=".test.env"
ENV_EXAMPLE_FILE=".test.env.example"

escape_char=$(printf "\x1b")

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

# RUN VALIDATIONS

# Find broken lines in .env file
if grep -q $'\r' "$ENV_FILE"; then
  echo "Error: $ENV_FILE contains Windows-style line endings. Please convert to Unix-style line endings."
  exit 1
fi
# Find lines that doen't match the pattern in .env file
if grep -q -v -E '^[A-Za-z_][A-Za-z0-9_]*=|^#|^$' "$ENV_FILE"; then
  # Print the error message and include also the broken line(s) and exit
  echo "Error: $ENV_FILE contains lines that do not match the pattern 'KEY=value', comments, or blank lines.
  Please fix or remove the following line(s):"
  grep -v -E '^[A-Za-z_][A-Za-z0-9_]*=|^#|^$' "$ENV_FILE"
  exit 1
fi
# Find the duplicates variables in .env file
awk -F '=' '{print $1}' "$ENV_FILE" | sort | uniq -d | while read -r var; do
  echo "Error: $ENV_FILE contains duplicate variable '$var'. Please remove the duplicate(s)."
  exit 1
done


handle_input() {
  read -rsn1 char # get 1 character
  if [[ $char == $escape_char ]]; then
      read -rsn2 char # read 2 more chars
  fi
}

# Helper function to prompt for a yes/no response
ask_yes_no() {

    echo "$1 (Y/n): "
    read -rsn1 response
    case "$response" in
      'y')
        return 0 ;;
      'n')
        return 1 ;;
      * ) echo "Please answer Y or n." ;;
    esac

}

# Process each module in .env.example
current_module=""

declare -a arr
# read the file line by line and fill the array
while IFS= read -r line; do
  arr=("${arr[@]}" "$line")
done < "$ENV_EXAMPLE_FILE"

# if .env file doesn't exists, create it
if [[ ! -f "$ENV_FILE" ]]; then
  touch "$ENV_FILE"
fi


# loop the array of variables from .env.example
for i in "${arr[@]}"; do
  # Trim leading and trailing whitespace
  line=$(echo "$i" | xargs)
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
    default_var_value=$(echo "$line" | cut -d '=' -f 2)

    # find if there is a variable defined in the current .env file
    if grep -q "^${var_name}=.*" "$ENV_FILE"; then
      # get the value of the variable
      default_var_value=$(grep "^${var_name}=" "$ENV_FILE" | cut -d '=' -f 2)
    
    # find if there is a variable defined in the current .env file in commented line
    elif grep -q "^#\s*${var_name}=.*" "$ENV_FILE"; then
      # get the value of the variable
      default_var_value=$(grep "^#\s*${var_name}=" "$ENV_FILE" | cut -d '=' -f 2)
    fi

    # replace first and last double quotes if there are any
    default_var_value=$(echo "$default_var_value" | sed 's/^"\(.*\)"$/\1/')

    # Prompt for the value of the variable
    read -r -p "Enter value for $var_name [$default_var_value]: " var_value
    var_value=${var_value:-$default_var_value}
    
    # check if the line exists in the .env file
    if grep -q "^${var_name}=.*" "$ENV_FILE"; then
      # replace the line
      sed -i '' "s/^${var_name}=.*/${var_name}=\"${var_value}\"/" "$ENV_FILE"
    else
      # append the line
      echo "${var_name}=\"${var_value}\"" >> "$ENV_FILE"
    fi
    

  # Write non-module lines directly (e.g., comments, blank lines)
  else
    var_name=$(echo "$line" | cut -d '=' -f 1)
    # Comment out variable in the skipped module
    if grep -q "^${var_name}=.*" "$ENV_FILE"; then
      # replace the line
      echo "Commenting line: $line"
      sed -i '' "s/^${var_name}=/#${var_name}=/" "$ENV_FILE"
    fi
  fi
done


echo ".env file created/updated based on $ENV_EXAMPLE_FILE."
