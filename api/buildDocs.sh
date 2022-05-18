#!/bin/bash
#npm run build-docs
typedoc --entryPointStrategy expand ./src
cd ../docs/developer/api

# move title to top of the page for all files 
echo "Move title"
for file in ./*.md ./*/*.md; do
	lineNum="$(grep -n '^#\ ' "$file" | head -n 1 | cut -d: -f1)"
	(grep '^#\ ' "$file" && grep -v '^#\ ' "$file") > temp.md
	sed -e "${lineNum}d" temp.md>"$file"
	sed -i "" '2 i\ ' "$file"
	rm temp.md
done

# set title of root readme and modules file
echo "Setting title of root readme"
sed -i "" '1s/^/---\nsidebar_position: 1\nsidebar_label: Introduction\n---\n/'  ./README.md
echo "Setting title of modules file"
sed -i "" '1s/^/---\nsidebar_position: 2\nsidebar_label: Table of Contents\n---\n/'  ./modules.md

# set the api code docs folder name and fix position
echo "Generating the category file for the api folder"
echo '{"label": "Api Code Documentation","position": 7}' > _category_.json

echo "Generating the category file for all folders"
echo '{"label": "Functions","position": 3}' > ./modules/_category_.json
echo '{"label": "Classes","position": 4}' > ./classes/_category_.json
echo '{"label": "Enums","position": 5}' > ./enums/_category_.json
echo '{"label": "Interfaces","position": 6}' > ./interfaces/_category_.json


# for local testing copy docs to trubudget-website repo, e.g.
# cp -a ../api ../../../../trubudget-website/docs/developer/