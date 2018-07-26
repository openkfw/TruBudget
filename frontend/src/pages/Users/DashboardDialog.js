import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import DashboardDialogContent from "./DashboardDialogContent";
import { compareObjects, fromAmountString } from "../../helper";

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
  const { projects, projectToAdd, dashboardDialogShown, content } = props;
  const { displayName, description, amount } = projectToAdd;
  const changes = compareObjects(projects, projectToAdd);
  let steps;
  switch (content) {
    case "addUser":
      steps = [
        {
          title: "Add User",
          content: <DashboardDialogContent {...props} />,
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
          content: <DashboardDialogContent {...props} />,
          nextDisabled:
            _isEmpty(displayName) ||
            _isEmpty(description) ||
            ((_isEmpty(amount) && isNaN(parseFloat(amount))) || _isEmpty(changes))
        }];
      break;
    case "editGroup":
      steps = [
        {
          title: "Edit Group",
          content: <DashboardDialogContent {...props} />,
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
