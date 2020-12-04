pat='^(api|bc|doc|ui|e2e|excel|email|all)([,](api|bc|doc|ui|e2e|excel|email))*([,](api|bc|doc|ui|e2e|excel|email))*([,](api|bc|doc|ui|e2e|excel|email))*([,](api|bc|doc|ui|e2e|excel|email))*([,](api|bc|doc|ui|e2e|excel|email))*\:.+'
message=`cat $1`
if [[ "$message" =~ $pat ]]; then 
  echo ""
else 
  echo "Always include a prefix in the commit message with the abbreviation of the project you're working on (api, bc, doc, ui, e2e, excel, email, all). E.g. 'git commit -m \"api,ui:new endpoint for project editing\"'. To skip this check use git commit -m \"skipping check\" --no-verify"
  exit 1;
fi

branchpat='[0-9]{1,5}-[a-z-]+';
branch=`git rev-parse --abbrev-ref HEAD`
if [[ "$branch" =~ $branchpat ]]; then 
  echo ""
else 
  echo "Lead with the number of the issue you are working on. Add a short description of what the task is about. Use hyphens '-' as separators. E.g. '456-project-edit'. To skip this check use git commit -m \"skipping check\" --no-verify"
  exit 1;
fi