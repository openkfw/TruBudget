import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import SubprojectDialogContent from "./SubprojectDialogContent";
import { compareObjects, fromAmountString } from "../../helper";

const handleCreate = props => {
  const { createSubProject, onDialogCancel, subprojectToAdd, location, storeSnackbarMessage, showSnackbar } = props;
  const { displayName, amount, description, currency } = subprojectToAdd;
  createSubProject(
    displayName,
    fromAmountString(amount).toString(),
    description,
    currency,
    location.pathname.split("/")[2]
  );
  onDialogCancel();
  storeSnackbarMessage(strings.common.added + " " + strings.common.subproject + " " + displayName);
  showSnackbar();
};

const handleEdit = props => {
  const {
    editSubproject,
    onDialogCancel,
    subProjects,
    subprojectToAdd,
    location,
    storeSnackbarMessage,
    showSnackbar
  } = props;

  const changes = compareObjects(subProjects, subprojectToAdd);
  const projectId = location.pathname.split("/")[2];
  if (!_isEmpty(changes)) {
    if (changes.amount) {
      changes.amount = fromAmountString(changes.amount).toString();
    }
    editSubproject(projectId, subprojectToAdd.id, changes);
    storeSnackbarMessage(strings.common.edited + " " + strings.common.subproject + " " + subprojectToAdd.displayName);
    showSnackbar();
  }

  onDialogCancel();
};

const SubprojectDialog = props => {
  const {
    subprojectToAdd,
    dialogTitle,
    createDialogShown,
    hideSubprojectDialog,
    editDialogShown,
    creationDialogShown,
    subProjects
  } = props;
  const changes = compareObjects(subProjects, subprojectToAdd);
  const specifcProps = props.editDialogShown
    ? {
        handleSubmit: handleEdit,
        dialogShown: editDialogShown
      }
    : {
        handleSubmit: handleCreate,
        dialogShown: creationDialogShown
      };

  const steps = [
    {
      title: strings.project.project_details,
      content: <SubprojectDialogContent {...props} />,
      nextDisabled:
        _isEmpty(subprojectToAdd.displayName) ||
        _isEmpty(subprojectToAdd.description) ||
        (_isEmpty(subprojectToAdd.amount) && isNaN(parseFloat(subprojectToAdd.amount))) ||
        _isEmpty(changes)
    }
  ];
  return (
    <div>
      <CreationDialog
        steps={steps}
        title={dialogTitle}
        numberOfSteps={steps.length}
        dialogShown={createDialogShown}
        onDialogCancel={hideSubprojectDialog}
        {...specifcProps}
        {...props}
      />
    </div>
  );
};

export default SubprojectDialog;
