import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import UserDialogContent from "./UserCreate";
import GroupDialogContent from "../Groups/GroupCreate";

const DashboardDialog = props => {
  console.log(props);

  const {
    projects,
    projectToAdd,
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
    showSnackbar
  } = props;
  const { username, password, displayName, organization } = userToAdd;

  const { groupId, name: groupName, groupUsers } = groupToAdd;

  let steps, handleSubmitFunc;
  console.log();

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
    case "editGroup":
      const group = groups.find(group => group.groupId === editId);
      const groupToEdit = {
        groupId: group.groupId,
        displayName: group.displayName,
        groupUsers: group.users
      };
      console.log(groupToEdit);
      steps = [
        {
          title: "Edit Group",
          content: <GroupDialogContent {...props} groupToAdd={groupToEdit} editMode={true} />,
          nextDisabled: true,
          hideSubmitButton: true
        }
      ];
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
