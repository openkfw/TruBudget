import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import { compareObjects, fromAmountString } from "../../helper";
import UserDialogContent from "./UserCreate";
import GroupDialogContent from "../Groups/GroupCreate";

const handleCreateUser = (username,
  password,
  organization,
  displayName,
  createUser,
  createUserGroup,
  showSnackbar,
  showErrorSnackbar,
  storeSnackbarMessage
) => {

  createUser(displayName, organization, username, password);
  //storeSnackbarMessage(strings.usersDashboard.user_created);//TODO
  //showSnackbar();

  // storeSnackbarMessage("Enter required information");
  // showErrorSnackbar();

};

const handleCreateUserGroup = (cb) => {
  cb();
  // storeSnackbarMessage("Group created.");
  // showSnackbar();
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

  const { projects, projectToAdd, dashboardDialogShown, dialogType, editId, groups, userToAdd, groupToAdd, createUser, organization: userOrganization, createUserGroup } = props;
  const { username, password, displayName, organization } = userToAdd


  const { groupId, name: groupName, groupUsers } = groupToAdd

  let steps, handleSubmitFunc;
  console.log();

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
      handleSubmitFunc = () => handleCreateUser(username, password, userOrganization, displayName, createUser);
      break;
    case "addGroup":
      steps = [
        {
          title: "Add Group",
          content: <GroupDialogContent {...props} />,
          nextDisabled:
            _isEmpty(groupId) ||
            _isEmpty(groupName) ||
            _isEmpty(groupUsers)
        }];
      handleSubmitFunc = () => handleCreateUserGroup(() => createUserGroup(groupId, groupName, groupUsers));
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
          nextDisabled: true,
          hideSubmitButton: true
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
      handleSubmit={() => handleSubmitFunc()}
      {...props}
    />
  );
};

export default DashboardDialog;
