#!/bin/bash
typedoc --entryPointStrategy expand ./src
cd ../docs/developer/api-docs

case "$OSTYPE" in
    darwin*)
        delimiter=true
esac

# move title to top of the page for all files
# add folder titles
# refactor title for Event and RequestData
echo "Formatting titles for all files"

for file in ./*.md ./*/*.md; do
    lineNum="$(grep -n '^#\ ' "$file" | head -n 1 | cut -d: -f1)"
    (grep '^#\ ' "$file" && grep -v '^#\ ' "$file") > temp.md
    sed -e "${lineNum}d" temp.md>"$file"
    sed -i ${delimiter:+""} '2 i\ ' "$file"
    sed -i ${delimiter:+""} 's/# Class:/#/g' $file
    sed -i ${delimiter:+""} 's/# Interface:/#/g' $file
    sed -i ${delimiter:+""} 's/# Enumeration:/#/g' $file
    sed -i ${delimiter:+""} 's/# Module:/#/g' $file

    title=$(sed '1q;d' $file)

    if [[ $title == "# Event" ]]; then
        pathToDoc=$(echo $(sed '4q;d' $file) | sed 's/.*\[\([^]]*\)\].*/\1/g')
        sed -i ${delimiter:+""} 's|# Event|# Event: '$pathToDoc'|g' $file

    fi
    if [[ $title == "# RequestData" ]]; then
        pathToDoc=$(echo $(sed '4q;d' $file) | sed 's/.*\[\([^]]*\)\].*/\1/g')
        sed -i ${delimiter:+""} 's|# RequestData|# RequestData: '$pathToDoc'|g' $file
    fi
    rm temp.md
done

# set title of root readme and modules file
echo "Setting title of root readme"
sed -i ${delimiter:+""} '1s/^/---\nsidebar_position: 1\nsidebar_label: Introduction\n---\n/'  ./README.md
echo "Setting title of modules file"
sed -i ${delimiter:+""} '1s/^/---\nsidebar_position: 2\nsidebar_label: Table of Contents\n---\n/'  ./modules.md

# set the api code docs folder name and fix position
echo "Generating the category file for the api folder"
echo '{"label": "Api Code Documentation","position": 7}' > _category_.json

echo "Generating the category file for all folders"
echo '{"label": "Functions","position": 3}' > ./modules/_category_.json
echo '{"label": "Classes","position": 4}' > ./classes/_category_.json
echo '{"label": "Enums","position": 5}' > ./enums/_category_.json
echo '{"label": "Interfaces","position": 6}' > ./interfaces/_category_.json


# for local testing copy docs to trubudget-website repo, e.g.
# cp -a ../api-docs ../../../../trubudget-website/docs/developer/
