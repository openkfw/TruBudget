import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import { compareObjects, fromAmountString } from "../../helper";
import UserDialogContent from "./UserCreate";
import GroupDialogContent from "../Groups/GroupCreate";

const handleCreate = props => {
  const { createProject, onDialogCancel, projectToAdd, location, storeSnackbarMessage, showSnackbar } = props;
  const { displayName, amount, description, currency, thumbnail } = projectToAdd;
  createProject(
    displayName,
    fromAmountString(amount).toString(),
    description,
    currency,
    location.pathname.split("/")[2],
    thumbnail
  );
  onDialogCancel();
  storeSnackbarMessage(strings.common.added + " " + strings.common.project + " " + displayName);
  showSnackbar();
};

const handleEdit = props => {
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

  const { projects, projectToAdd, dashboardDialogShown, dialogType, editId, groups } = props;

  const { displayName, description, amount } = projectToAdd;
  const changes = compareObjects(projects, projectToAdd);
  let steps;
  switch (dialogType) {
    case "addUser":
      steps = [
        {
          title: "Add User",
          content: <UserDialogContent {...props} />,
          nextDisabled:
            _isEmpty(displayName) ||
            _isEmpty(description) ||
            ((_isEmpty(amount) && isNaN(parseFloat(amount))) || _isEmpty(changes))
        }];
      break;
    case "addGroup":
      steps = [
        {
          title: "Add Group",
          content: <GroupDialogContent {...props} />,
          nextDisabled:
            _isEmpty(displayName) ||
            _isEmpty(description) ||
            ((_isEmpty(amount) && isNaN(parseFloat(amount))) || _isEmpty(changes))
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
            _isEmpty(description) ||
            ((_isEmpty(amount) && isNaN(parseFloat(amount))) || _isEmpty(changes))
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
      {...props}
    />
  );
};

export default DashboardDialog;
