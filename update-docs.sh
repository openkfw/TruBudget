
trubudget_projects=('frontend' 'api' 'blockchain' 'provisioning' 'excel-export-service' 'email-notification-service' 'storage-service')

for project in "${trubudget_projects[@]}"; do
    eval "cd $project"
    command_output=$(npm run generate-env-vars-docs --silent -- --output-table --skip-table-header --add-service-name-column --skip-text)
    
    cp "environment-variables.md" "../docs/environment-variables/$project-environment-variables.md"
    eval "cd .."
done

