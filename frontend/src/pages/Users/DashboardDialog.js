import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import { compareObjects, fromAmountString } from "../../helper";
import UserDialogContent from "./UserCreate";
import GroupDialogContent from "../Groups/GroupCreate";

const handleCreateUser = (displayName,
  organization = "ACMECorp",
  password,
  username,
  createUser,
  showSnackbar,
  showErrorSnackbar,
  storeSnackbarMessage
) => {



  console.log(createUser + displayName + organization + password + username);
  createUser(displayName, "ACMECorp", username, password);
  //storeSnackbarMessage(strings.usersDashboard.user_created);//TODO
  //showSnackbar();

  // storeSnackbarMessage("Enter required information");
  // showErrorSnackbar();

};

const handleEdit = (props) => {
  const { editProject, onDialogCancel, projectToAdd, projects, storeSnackbarMessage, showSnackbar } = props;

  const changes = compareObjects(projects, projectToAdd);

  if (!_isEmpty(changes)) {
    if (changes.amount) {
      changes.amount = fromAmountString(changes.amount).toString();
    }
    editProject(projectToAdd.id, changes);
    storeSnackbarMessage(strings.common.edited + " " + strings.common.project + " " + projectToAdd.displayName);
    showSnackbar();
  }
  onDialogCancel();
};

const DashboardDialog = props => {
  console.log(props);

  const { projects, projectToAdd, dashboardDialogShown, dialogType, editId, groups, userToAdd, groupToAdd } = props;
  const { username, password, displayName, organization } = userToAdd
  console.log(groupToAdd);
  console.log(userToAdd);

  const { groupId, groupName, users } = groupToAdd

  let steps;
  switch (dialogType) {
    case "addUser":
      steps = [
        {
          title: "Add User",
          content: <UserDialogContent {...props} />,
          nextDisabled:
            _isEmpty(username) ||
            _isEmpty(password) ||
            _isEmpty(displayName)
        }];
      break;
    case "addGroup":
      steps = [
        {
          title: "Add Group",
          content: <GroupDialogContent {...props} />,
          nextDisabled:
            _isEmpty(username) ||
            _isEmpty(username) ||
            _isEmpty(username)
        }];
      break;
    case "editGroup":
      const group = groups.find(group => group.groupId === editId)
      const groupToEdit = {
        groupId: group.groupId,
        displayName: group.displayName,
        groupUsers: group.users
      }
      console.log(groupToEdit)
      steps = [
        {
          title: "Edit Group",
          content: <GroupDialogContent  {...props} groupToAdd={groupToEdit} editMode={true} />,
          nextDisabled:
            _isEmpty(displayName) ||
            _isEmpty(username) ||
            _isEmpty(username)
        }];
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
      handleSubmit={() => handleCreateUser(username, password, organization, displayName, props.createUser, ...props)}
      {...props}
    />
  );
};

export default DashboardDialog;
