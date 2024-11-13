#!/bin/bash

# Input paths for the .env files
ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"

escape_char=$(printf "\x1b")

# Check if this is the git main branch
if [[ $(git rev-parse --abbrev-ref HEAD) != "main" ]]; then
  echo "Error: Please run this script on the main branch."
  echo "Run 'git checkout main' to switch to the main branch."
  # exit 1
fi
# Check if script is on latest commit
git fetch
if [[ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]]; then
  echo "Error: Please run this script on the latest commit."
  echo "Run 'git pull' to update your local repository."
  # exit 1
fi

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
duplicate_present=false
while read -r var; do
  if [[ -z "$var" ]]; then
    continue
  fi
  duplicate_present=true
  echo "Error: $ENV_FILE contains duplicate variable(s) '$var'. Please remove the duplicate(s)."
done <<< $(awk -F '=' '{if ($1 != "" && $1 !~ /^#/) print $1}' "$ENV_FILE" | sort | uniq -d)

if [[ $duplicate_present == true ]]; then
  exit 1
fi

read_value_from_env_example_file() {
  # Read the value of the variable from the .env file
  var_name=$1
  # extract everything after variable name plus equal sign
  var_value=$(grep "^${var_name}=" "$ENV_EXAMPLE_FILE" | sed -E 's/^[^=]+=(.*)/\1/')

  # If the value is wrapped in double quotes
  if [[ $var_value =~ ^\".*$ ]]; then
    everything_after_first_character=$(echo "$var_value" | sed 's/^.\(.*\)$/\1/')
    # extract everything before first quote using negative lookahead
    everything_before_first_quote=$(echo "$everything_after_first_character" | perl -pe 's/(.*?[^\\])".*/\1/')
    var_value=$(echo "$everything_before_first_quote")
  else
    everything_before_first_whitespace_character=$(echo "$var_value" | sed 's/^\([^ ]*\).*/\1/')
    var_value=$(echo "$everything_before_first_whitespace_character")
  fi

  # In case of empty value there is one quote in var_value, return empty string
  if [[ $var_value == "\"" ]]; then
    var_value=""
  fi
  echo "$var_value"
}

read_comment_from_env_example_file() {
  # Read the value of the variable from the .env file
  var_name=$1
  # extract everything after variable name plus equal sign
  var_with_comment_value=$(grep "^${var_name}=" "$ENV_EXAMPLE_FILE" | sed -E 's/^[^=]+=(.*)/\1/')
  var_value=$(read_value_from_env_example_file $var_name)
  var_value_length=${#var_value}

  # If the value is wrapped in double quotes
  if [[ $var_with_comment_value =~ ^\".*$ ]]; then
    var_value_length=$(($var_value_length + 2))
    # cut the comment based on var_value length
    comment="${var_with_comment_value:$var_value_length}"
  else
    comment="${var_with_comment_value:$var_value_length}"
  fi
  comment="${comment#"${comment%%[![:space:]]*}"}"  # Remove leading whitespace
  comment="${comment%"${comment##*[![:space:]]}"}"  # Remove trailing whitespace

  echo "$comment"
}

read_value_from_env_file() {
  # Read the value of the variable from the .env file
  var_name=$1
  is_silent=$2
  var_value=$(grep "^${var_name}=" "$ENV_FILE" | sed -E 's/^[^=]+=(.*)/\1/')
  
  # if value is not found in the .env file, return 0
  if [[ -z "$var_value" ]]; then
    return 0
  fi

  # In case of empty value there is one quote in var_value, return empty string
  if [[ $var_value == "\"\"" || $var_value == "" ]]; then
    var_value=""

  # If the value is wrapped in double quotes
  elif [[ $var_value =~ ^\".*$ ]]; then
    everything_after_first_character=$(echo "$var_value" | sed 's/^.\(.*\)$/\1/')
    # extract everything before first quote using negative lookahead
    everything_before_first_quote=$(echo "$everything_after_first_character" | perl -pe 's/(.*?[^\\])".*/\1/')
    var_value=$(echo "$everything_before_first_quote")
  else
    everything_before_first_whitespace_character=$(echo "$var_value" | sed 's/^\([^ ]*\).*/\1/')
    var_value=$(echo "$everything_before_first_whitespace_character")
  fi

  if [[ $is_silent != "silent" ]]; then
    echo "$var_value"
  fi
  
  return 1
}

read_commented_value_from_env_file() {
  # Read the value of the variable from the .env file
  var_name=$1
  
  var_value=$(grep "^#\s*${var_name}=" "$ENV_FILE" | perl -pe 's/^#\s*[^=]+=(.*)/\1/')

  if [[ $var_value == "\"\"" || $var_value == "" ]]; then
    var_value=""
  # If the value is wrapped in double quotes
  elif [[ $var_value =~ ^\".*$ ]]; then
    everything_after_first_character=$(echo "$var_value" | sed 's/^.\(.*\)$/\1/')
    # extract everything before first quote using negative lookahead
    everything_before_first_quote=$(echo "$everything_after_first_character" | perl -pe 's/(.*?[^\\])".*/\1/')
    var_value=$(echo "$everything_before_first_quote")
  else
    everything_before_first_whitespace_character=$(echo "$var_value" | sed 's/^\([^ ]*\).*/\1/')
    var_value=$(echo "$everything_before_first_whitespace_character")
  fi

  echo "$var_value"
}

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

# if .env file doesn't exists, create it
if [[ ! -f "$ENV_FILE" ]]; then
  touch "$ENV_FILE"
fi

# Process each module in .env.example
current_module="-"

declare -a arr
# read the file line by line and fill the array
while IFS= read -r line; do
  arr=("${arr[@]}" "$line")
done < "$ENV_EXAMPLE_FILE"

declare -a delta_arr
ALL_VARIABLES_SET_IN_ENV_FILE=true
echo ""
echo "Wait a moment while we valiate the .env file..."
# check if every variable from .env.example is set in .env file
for i in "${arr[@]}"; do
  # Trim leading and trailing whitespace
  line=$(echo "$i")
  line="${line#"${line%%[![:space:]]*}"}"  # Remove leading whitespace
  line="${line%"${line##*[![:space:]]}"}"  # Remove trailing whitespace

  if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    var_name=$(echo "$line" | cut -d '=' -f 1)
    
    if read_value_from_env_file $var_name "silent"; then
      ALL_VARIABLES_SET_IN_ENV_FILE=false
      echo "Variable $var_name is not set in $ENV_FILE."
      delta_arr=("${delta_arr[@]}" "$line")
    fi
  fi
done

# if not all variables are set, ask if the user wants to configure only the delta variables
if [[ $ALL_VARIABLES_SET_IN_ENV_FILE == false ]]; then
  echo ""
  if ask_yes_no "Not all variables are set in $ENV_FILE. Would you like to configure only the missing variables?"; then
    echo "Configuring only the missing variables..."
    echo ""
    arr=("${delta_arr[@]}")
  else
    echo "Configuring all variables..."
    echo ""
  fi
fi


previous_variable=""
previous_adding_new_line=false
# loop the array of variables from .env.example
for i in "${arr[@]}"; do
  # Trim leading and trailing whitespace
  line=$(echo "$i")
  line="${line#"${line%%[![:space:]]*}"}"  # Remove leading whitespace
  line="${line%"${line##*[![:space:]]}"}"  # Remove trailing whitespace

  # Detect module sections with "# MODULE: <module_name>"
  if [[ $line =~ ^#\ MODULE:\ (.*) ]]; then
    current_module="${BASH_REMATCH[1]}"

    # Check if module line includes a REQUIRES condition
    if [[ $line =~ REQUIRES:\ (.*) ]]; then
      requires="${BASH_REMATCH[1]}"
      # Check if all required variables are set to match the condition
      all_set=true
      for var in $(echo $requires | tr "," "\n"); do
        # Extract the variable name and value and trim leading/trailing whitespace
        required_var_name=$(echo "$var" | cut -d '=' -f 1)
        required_var_value=$(echo "$var" | cut -d '=' -f 2)

        if [[ $(read_value_from_env_file $required_var_name) != "$required_var_value" ]]; then
          all_set=false
          break
        fi
      done
      if [[ $all_set == false ]]; then
        echo "Skipping $current_module because not all required variables are set: $requires"
        current_module=""
      fi

    # Ask if the user wants to configure this module
    elif ask_yes_no "Would you like to configure $current_module?"; then
      echo "Configuring $current_module..."
    else
      current_module=""
    fi

    # Add the module line to the .env file
    if [[ $previous_adding_new_line == true ]]; then
      echo "$line" >> "$ENV_FILE"
      previous_adding_new_line=true
    fi
    

  elif [[ $line =~ ^#\ END\ MODULE(.*) ]]; then
    current_module="-"

    if [[ $previous_adding_new_line == true ]]; then
      echo "$line" >> "$ENV_FILE"
      previous_adding_new_line=true
    fi

  # Process variable lines if in an active module
  elif [[ -n "$current_module" && $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    # Extract the variable name
    var_name=$(echo "$line" | cut -d '=' -f 1)
    default_var_value=$(read_value_from_env_example_file $var_name)
    comment=$(read_comment_from_env_example_file $var_name)

    # find if there is a variable defined in the current .env file
    if ! read_value_from_env_file $var_name "silent"; then
      # get the value of the variable
      
      default_var_value=$(read_value_from_env_file $var_name)
    
    # find if there is a variable defined in the current .env file in commented line
    elif [[ -n $(read_commented_value_from_env_file $var_name) ]]; then
      # get the value of the variable
      default_var_value=$(read_commented_value_from_env_file $var_name)
    fi

    # If comment includes the "DO NOT CHANGE" string, skip the variable
    if [[ $comment =~ DO\ NOT\ CHANGE ]]; then
      echo "Skipping $var_name because it should not be changed."
      var_value="$default_var_value"
    else
    
      # Prompt for the value of the variable
      echo ""
      echo $comment
      read -r -p "Enter value for $var_name [$default_var_value]: " var_value
      var_value=${var_value:-$default_var_value}
    fi

    # Determine of variable is number or boolean
    if [[ $var_value =~ ^[0-9]+$ ]]; then
      var_value="$var_value"
    elif [[ $var_value =~ ^true$|^false$ ]]; then
      var_value="$var_value"
    else
      var_value="\"$var_value\""
    fi

    # escape backslashes
    var_value=$(echo "$var_value" | sed 's/\\/\\\\/g')
    
    # check if the line exists in the .env file
    if grep -q "^${var_name}=.*" "$ENV_FILE"; then
      # replace the line
      sed -i '' "s/^${var_name}=.*/${var_name}=${var_value}/" "$ENV_FILE"
      previous_adding_new_line=false
    else
      # append the line
      if [[ -n "$previous_variable" ]]; then
        # insert the line after the previous variable
        sed -i.temp "/^${previous_variable}=.*/a\\
${var_name}=${var_value}
" "$ENV_FILE" && rm "${ENV_FILE}.temp"
        previous_adding_new_line=true
      else
        echo "${var_name}=${var_value}" >> "$ENV_FILE"
        previous_adding_new_line=true
      fi
    fi
    
    previous_variable=$var_name

  # Output non-module lines directly (e.g., comments)
  elif [[ $line =~ ^#[^=]*$ ]]; then
    echo "$line"

  # Blank lines
  elif [[ $line =~ ^$ ]]; then
    echo ""
  else
    var_name=$(echo "$line" | cut -d '=' -f 1)
    # Comment out variable in the skipped module
    if grep -q "^${var_name}=.*" "$ENV_FILE"; then
      # replace the line
      echo "Commenting line: $line"
      sed -i '' "s/^${var_name}=/#${var_name}=/" "$ENV_FILE"
      previous_adding_new_line=false
    fi
  fi
done


echo ".env file created/updated based on $ENV_EXAMPLE_FILE."
