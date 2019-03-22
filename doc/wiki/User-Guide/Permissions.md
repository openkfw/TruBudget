# Permissions

**Description:**

The purpose of a permission is to allow access to information or functionality to certain users only. Most permissions are self explaining, but if more information are required click on the intent of the permission. The intent for example for "create User" would be global.createUser. A complete [list of all existing permissions](#permission-intents) can be found at the end of this document.

## Global permissions

**Description:**

All permissions not limited to projects, subprojects or workflowitems are global permissions. Global permissions can be added to users or to groups.
All global permissions are documented at the bottom of this document.

### New permissions

**Description:**

Once a user/group is created, administrators can grant/revoke global permissions for them.

### Admin permissions

**Description:**

A sample set of global permissions are:

- ... create projects
- ... create user/group
- ... grant/revoke global permissions to others
- ... access the nodes section

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "User" menu point
3. Click the lock item in line of the user that you want to grant/revoke permissions..
4. Select the permissions that you want to grant/revoke

![open global permission dialog](../uploads/Screenshots/open_global_permission_dialog.jpg)

## Project permissions

**Description:**

These section describes all permissions related to a project.

**Notes:**

- More information about a specific intent can be found in the [project section](./Projects/Project.md).
- The user who created the project is automatically assigned to it.

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the lock icon in the bottom right corner of a project to open the permissions dialog

![open project permission dialog](../uploads/Screenshots/open_project_permission_dialog.jpg)

### View permissions

**Description:**

- "view project in overview" : show the project on the overview site
- "view project details" : show the project's details by accessing the project details site

**Notes:**

- make sure to grant the viewSummary-permission before granting the viewDetails-permission so that the user is able to see the project

### Write permissions

**Description:**

- "Create subprojects" : create a subproject
- "Assign project to others" : assign a user/group to a project
- "Close project" : close a project

**Notes:**

- do not forget to grant the view permissions of the project before granting write permissions

### Admin permissions

**Description:**

- "View permissions" : show which user/group has which permission on the project
- "Grant permissions" - grant project permissions to a user/group
- "Revoke permissions" - revoke project permissions from a user/group

**Notes:**

- do not forget to grant the viewSummary-permission of the project before granting admin permissions

## Subproject permissions

**Description:**

These section describes all permissions related to a subproject

**Notes:**

- More information about a specific action on a subproject can be found in the [subproject section](./Projects/Subproject.md).

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project
4. Click the lock icon on the right of the subproject to open the permissions dialog

![open subproject permission dialog](../uploads/Screenshots/open_subproject_permission_dialog.jpg)

### View permissions

**Description:**

Following intents do exist related to view permissions of a subproject:

- "view subproject overview" : show the subproject on the project detail site
- "view subproject details" : show the subproject's details by accessing the subproject details site

**Notes:**

- make sure to grant the viewSummary-permission before granting the viewDetails-permission so that the user is able to see the subproject

### Write permissions

**Description:**

Following intents do exist related to write permissions of a project:

- "Create workflow items" : create a workflowitem
- "Update subproject" : edit title, currency, comment or budget amount of the subproject
- "Assign subproject" : assign a user/group to the subproject
- "Close subproject" : close the subproject
- "Reorder workflow items" : reorder workflowitems that are not redacted/closed

**Notes:**

- do not forget to grant the view permissions of the subproject before granting write permissions

### Admin permissions

**Description:**

- "View subproject permissions" : show which user/group has which permission on the subproject
- "Grant subproject permissions" - grant subproject permissions to a user/group
- "Revoke subproject permissions" - revoke subproject permissions from a user/group

**Notes:**

- do not forget to grant the viewSummary-permission of the project before granting admin permissions

## Workflow permissions

**Description:**

These section describes all permissions related to a workflowitem

**Notes:**

- More information about a specific intent can be found in the [workflowitem section](./Projects/Workflowitem.md).
- If a user has any write permission but no view permission the workflowitem is shown as redacted.

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project
4. Click the grey magnifier icon on the most right of the subproject you want to view
5. Click the lock icon on the right of the workflowitem to open the permissions dialog

![open workflowitem permission dialog](../uploads/Screenshots/open_workflowitem_permission_dialog.jpg)

### View permissions

**Description:**

Following intents do exist related to view permissions of a subproject:

- "View workflowitem" : show the workflowitem' details on the subproject detail site

**Notes:**

- If a user has any write permission but no view permission the workflowitem is shown as redacted.

### Write permissions

**Description:**

Following intents do exist related to write permissions of a project:

- "Assign workflowitem" : assign a user/group to the workflowitem
- "Update workflowitem" : edit title, comment, budget or add documents to the workflowitem
- "Close workflowitem" : close the workflowitem

**Notes:**

- do not forget to grant the view permissions of the subproject before granting write permissions

### Admin permissions

**Description:**

Following permissions do exist related to a workflowitem:

- "View subproject permissions" : show which user/group has which permission on the workflowitem
- "Grant subproject permissions" - grant workflowitem permissions to a user/group
- "Revoke subproject permissions" - revoke workflowitem permissions from a user/group

**Notes:**

- do not forget to grant the viewSummary-permission of the project before granting admin permissions

## Permission intents

Following list describes all existing permissions. If you need more information how you can make use of a specific permission, access the documentation of the specific section via the [User-Guide overview](./README.md).

| Intent                                        | Description                                                                                                            |
| :-------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| notification.list                             | show notifications on notification site                                                                                |
| notification.markRead                         | mark notifications as read with a click on a notification                                                              |
| network.listActive                            | show how many peers are connected to the current network in the upper right corner (currently logged in user excluded) |
| global.listPermissions                        | the intent has no influence on the trubudget website                                                                   |
| global.grantPermission                        | assign admin permissions to a user while creating a user                                                               |
| global.grantAllPermissions                    | assign admin permissions to a user while creating a user                                                               |
| global.revokePermission                       | the intent has no influence on the trubudget website                                                                   |
| global.createProject                          | create a project on the overview site                                                                                  |
| global.createUser                             | create a user with or without admin permissions (requires global.grantPermission)                                      |
| global.createGroup                            | create a group with or without admin permissions                                                                       |
| group.addUser                                 | add a user/group to a group                                                                                            |
| group.removeUser                              | add a user/group to a group                                                                                            |
| network.list                                  | access the nodes site                                                                                                  |
| network.voteForPermission                     | vote for a new organization to join the network                                                                        |
| network.approveNewOrganization                | approve a new organization to join the network                                                                         |
| network.approveNewNodeForExistingOrganization | approve a new node for an existing organization                                                                        |
| project.viewSummary                           | show the project on the overview site                                                                                  |
| project.viewDetails                           | show the project's details by accessing the project details site                                                       |
| project.assign                                | assign a user/group to the project                                                                                     |
| project.update                                | the intent has no influence on the trubudget website                                                                   |
| project.intent.listPermissions                | show which user/group has which permission on the project                                                              |
| project.intent.grantPermission                | grant project permissions to a user/group                                                                              |
| project.intent.revokePermission               | revoke project permissions from a user/group                                                                           |
| project.createSubproject                      | create a subproject                                                                                                    |
| project.viewHistory                           | access the history of the project                                                                                      |
| project.close                                 | close the project                                                                                                      |
| subproject.viewSummary                        | show the subproject on the project detail site                                                                         |
| subproject.viewDetails                        | show the subproject's details by accessing the subproject details site                                                 |
| subproject.assign                             | assign a user/group to the subproject                                                                                  |
| subproject.update                             | edit title, currency, comment or budget amount of the subproject                                                       |
| subproject.intent.listPermissions             | show which user/group has which permission on the subproject                                                           |
| subproject.intent.grantPermission             | grant subproject permissions to a user/group                                                                           |
| subproject.intent.revokePermission            | revoke subproject permissions from a user/group                                                                        |
| subproject.createWorkflowitem                 | create a workflowitem                                                                                                  |
| subproject.viewHistory                        | access the history of the subproject                                                                                   |
| subproject.close                              | close the subproject                                                                                                   |
| subproject.reorderWorkflowitems               | reorder workflowitems that are not redacted/closed                                                                     |
| workflowitem.view                             | show the workflowitem' details on the subproject detail site                                                           |
| workflowitem.assign                           | assign a user/group to the workflowitem                                                                                |
| workflowitem.update                           | edit title, comment, budget or add documents to the workflowitem                                                       |
| workflowitem.intent.listPermissions           | show which user/group has which permission on the workflowitem                                                         |
| workflowitem.intent.grantPermission           | grant workflowitem permissions to a user/group                                                                         |
| workflowitem.intent.revokePermission          | revoke workflowitem permissions from a user/group                                                                      |
| workflowitem.close                            | close the workflowitem                                                                                                 |
