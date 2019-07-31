# TruBudget

## Postman

Once you have Postman up and running you will need these two files to set it up.

* TruBudget.postman_collection.json

* TruBudget.postman_environment.json



### Environment

Environments in postman are a couple of variables and variable values that can be used in a command. To import the environment click on "Settings" in the upper right corner right next to the eye. Click the import-button, select the file in the dialog box and you are done! You can see all the environment variables by clicking the eye-icon in the upper right corner.

### Collection

A collection generally lets you organize requests by creating folders and grouping them together. In the collection you can find all of the API's endpoints and additionally a "RunnerScripts"-folder. To import the collection click on import in the upper left corner and drag the file into the dialog box.
The TruBudget-collection should have appeared on the left side. Click to expand and view requests.

If you want to create a subproject, workflowitem or a notification you can open postmans Runner in the upper left corner and start it.
Under "All Collections" click on the TruBudget-folder, then RunnerScripts and choose one of the three options listed there. 
Set "Environment" from "noEnvironment" to "TruBudget" and hit "Run [CreateSubproject | CreateWorkflowitem | CreateNotification ]"

The generic projects, subprojects and users that are created in RunnerScripts can be modified like any request, but don't forget to save all 
changes before starting the runner. Be aware that projectIds and userIds have to be unique! If you want to use the runner more than once you will have to change those Ids in the createUser and createProject requests.