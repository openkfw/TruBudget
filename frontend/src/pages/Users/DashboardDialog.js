import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import UserDialogContent from "./UserDialogContent";
import GroupDialogContent from "./GroupDialogContent";

const DashboardDialog = props => {
  const {
    dashboardDialogShown,
    dialogType,
    editId,
    groups,
    userToAdd,
    groupToAdd,
    createUser,
    organization: userOrganization,
    hideDashboardDialog,
    createUserGroup,
    storeSnackbarMessage,
    showSnackbar,
    grantAllUserPermissions,
    users,
    globalPermissions,
    expandPermissionsPanel,
    permissionsExpanded
  } = props;
  const { username, password, displayName, hasAdminPermissions } = userToAdd;

  const { groupId, name: groupName, groupUsers } = groupToAdd;
  let steps, handleSubmitFunc;
  switch (dialogType) {
    case "addUser":
      steps = [
        {
          title: "Add User",
          content: <UserDialogContent {...props} />,
          nextDisabled: _isEmpty(username) || _isEmpty(password) || _isEmpty(displayName)
        }
      ];
      handleSubmitFunc = () => {
        createUser(displayName, userOrganization, username, password);
        if (hasAdminPermissions) {
          grantAllUserPermissions(username);
        }
        hideDashboardDialog();
        storeSnackbarMessage(strings.usersDashboard.user_created);
        showSnackbar();
      };
      break;
    case "addGroup":
      steps = [
        {
          title: "Add Group",
          content: <GroupDialogContent {...props} />,
          nextDisabled: _isEmpty(groupId) || _isEmpty(groupName) || _isEmpty(groupUsers)
        }
      ];
      handleSubmitFunc = () => {
        createUserGroup(groupId, groupName, groupUsers);
        hideDashboardDialog();
        storeSnackbarMessage(strings.groupDashboard.group_created);
        showSnackbar();
      };
      break;
    case "editUser":
    const user = users.find(user => user.id === editId);
    const userToEdit = {
      username: user.id,
      organization: user.organization,
      displayName: user.displayName
    }
    steps = [
      {
        title: "Edit Permissions",
        content: <UserDialogContent {...props} userToAdd={userToEdit} editMode={true} globalPermissions={globalPermissions} expandPermissionsPanel = {expandPermissionsPanel}
        permissionsExpanded={permissionsExpanded}/>,
        nextDisabled: false,
        hideCancel: true,
        submitButtonText: strings.common.done
      }
    ];
    handleSubmitFunc = () => {
      expandPermissionsPanel(true)
      hideDashboardDialog();
    };

    break;
    case "editGroup":
      const group = groups.find(group => group.groupId === editId);
      const groupToEdit = {
        groupId: group.groupId,
        displayName: group.displayName,
        groupUsers: group.users
      };
      steps = [
        {
          title: "Edit Group",
          content: <GroupDialogContent {...props} groupToAdd={groupToEdit} editMode={true} />,
          nextDisabled: false,
          hideCancel: true,
          submitButtonText: strings.common.done
        }
      ];
      handleSubmitFunc = () => {
        hideDashboardDialog();
      };

      break;

    default:
      steps = [{ title: "no content" }];
      break;
  }

  return (
    <CreationDialog
      steps={steps}
      title={steps[0].title}
      numberOfSteps={steps.length}
      onDialogCancel={props.hideDashboardDialog}
      dialogShown={dashboardDialogShown}
      handleSubmit={() => handleSubmitFunc()}
      {...props}
    />
  );
};

export default DashboardDialog;
