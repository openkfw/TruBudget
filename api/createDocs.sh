#!/bin/bash
npm run build-docs
cd ../docs/developer/api
echo "Generating the category file"
echo '{"label": "Api Code Documentation","position": 7}' > _category_.json
echo "Setting title of root readme"
sed -i "" '1s/^/---\nsidebar_position: 1\nsidebar_label: Introduction\n---\n/'  ./README.md
echo "Setting title of modules file"
sed -i "" '1s/^/---\nsidebar_position: 2\nsidebar_label: Table of Contents\n---\n/'  ./modules.md

# add path to your trubudget-website repo, then uncomment
cp -a ../api ../../../../trubudget-website/docs/developer/