# Subproject

- [Subproject](#subproject)
  - [View subprojects](#view-subprojects)
  - [View subproject details](#view-subproject-details)
  - [Create a subproject](#create-a-subproject)
  - [Update a subproject](#update-a-subproject)
  - [Assign an User/Group to a subproject](#assign-an-usergroup-to-a-subproject)
  - [Close subproject](#close-subproject)
  - [View the history of a subproject](#view-the-history-of-a-subproject)
  - [View the additional data of a subproject](#view-the-additional-data-of-a-subproject)
  - [Permissions on subproject](#permissions-on-subproject)
  - [Create a workflowitem](#create-a-workflowitem)

A project is normally split into a fraction of sub-task and Trubudget calls them **Subprojects**.
In case of the school example the overall project would be the "School" having multiple subprojects like Design studies, Construction lot, Equipment...

There are some different permissions which affect subprojects.

- subproject.intent.listPermissions
- subproject.intent.grantPermission
- subproject.intent.revokePermission
- subproject.viewSummary
- subproject.viewDetails
- subproject.assign
- subproject.update
- subproject.close
- subproject.archive
- subproject.createWorkflowitem
- subproject.reorderWorkflowitems
- subproject.viewHistory

More details about the permission model can be found in the [Permissions section](../Permissions.md).

## View subprojects

**Description:**

View all subprojects where the current user has view-permissions on.

**Notes:**

- To view the subproject's details take a look at the [View subproject details section](#view-subproject-details) below.

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project

![show subprojects](../../uploads/Screenshots/view_projects.jpg)

4. At the bottom half of the site all subprojects of the current project are viewed

## View subproject details

**Description:**

View details like budget distribution or task status of a subproject.

**Notes:**

- The subproject.viewDetails permission does not permit to view any workflowitem.

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project
4. Click the grey magnifier icon on the most right of the subproject you want to view

![view subproject details](../../uploads/Screenshots/view_details_subproject.jpg)

## Create a subproject

**Description:**

Create a new subproject defining title, comment, currency and budget.

**Notes:**

- Do not forget to permit other users to view/edit the newly created subproject.
- You have to add at least one budget before you can submit the project.
- To add a budget, the "+" button needs to be pressed. Only budgets that appear above the text field are saved to the blockchain.

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project
4. Click the '+' button on the right to open the creation dialog

![create a  subproject](../../uploads/Screenshots/create_subproject.jpg)

5. Fill in the required fields:

   - "Subproject Title": Title of the subproject
   - "Comment": A little description or comment refering to the subproject
   - "Organization": Organization that the budget belongs to
   - "Currency": The currency of the organization's budget

6. Add the projected budget of the organization by clicking the "+" symbol
   ![create a  project](../../uploads/Screenshots/add_subproject_2.jpeg)
   After this, the entered budget will appear on the screen
   ![create a  project](../../uploads/Screenshots/add_subproject_3.jpeg)

7. Click the "Submit"-button to create a new subproject.
   ![create a  project](../../uploads/Screenshots/add_subproject_4.jpeg)

## Update a subproject

**Description:**

Update details like budget amount or title of a subproject.

**Notes:**

- The pen icon can only be viewed if the current user has update permissions.
- The pen icon disappear if the subproject is closed

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project
4. Click the pen icon next to the status of the subproject which shall be updated
5. Fill in the fields that shall be updated:

   - "Subproject Title": Title of the subproject
   - "Comment": A little description or comment refering to the subproject
   - "Currency": Currency of the subproject

6. Click the "Submit"-button to update the subproject.

## Assign an User/Group to a subproject

**Description:**

Assign a User or Group to a subproject to show which User or Group is responsible for it.

**Notes:**

- Only assigning a user to a subproject doesn't permit this user to view the subproject. These permissions have to be set separately.

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project
4. Click the grey magnifier icon on the most right of the subproject you want to view
5. Click the assignee dropdown field to open a selection where the right user or group can be selected and assigned to the current subproject

![change subproject assignee](../../uploads/Screenshots/change_subproject_assignee.jpg)

## Close subproject

**Description:**

Close a subproject when all workflowitems are closed.

**Notes:**

- A subproject can only be closed if all workflowitems are closed and the user has the subprojectproject.close permission.

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project
4. Click the grey magnifier icon on the most right of the subproject you want to view
5. Click the done-button next to the status section to close the current subproject

## View the history of a subproject

**Description:**

The history contains all activities done directly refer to the current subproject.

**Notes:**

- The history of actions refer to workflowitems are also viewed.

**Instructions:**

1. Click the button in the upper left corner to open the side-navigation-bar
2. Click the "Projects" menu point
3. Click the blue magnifier icon in the bottom right corner of a project
4. Click the grey magnifier icon on the most right of the subproject you want to view
5. Click the grey button below the '+' button on te right to open the right sidebar viewing the history of the current subproject.

![show subproject history](../../uploads/Screenshots/view_subproject_history.jpg)

## View the additional data of a subproject

**Description:**

The additional data is a free field that can be used to extend the subproject data beyond the visible information like display name and budget. To view this data, an additional button was added that opens a window containing the data of this field.

**Notes:**

- There is no logic to format the data.

**Instructions:**

1. Click the "..." button on the right side of the subproject
2. A window appears containing the additional information on the subproject
3. Close the window by clicking "close"

![show subproject additional data](../../uploads/Screenshots/subproject_info.jpeg)
![show subproject additional data screen](../../uploads/Screenshots/subproject_info_2.jpeg)

## [Permissions on subproject](../Permissions.md)

## [Create a workflowitem](./Workflowitem.md)
