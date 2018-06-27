import React from "react";

import _isEmpty from "lodash/isEmpty";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import SubprojectDialogContent from "./SubprojectDialogContent";
import { compareObjects, fromAmountString } from "../../helper";

const handleCreate = props => {
  const { createSubProject, onDialogCancel, subprojectToAdd, showSnackBar, storeSnackBarMessage, location } = props;
  const { displayName, amount, description, currency } = subprojectToAdd;
  createSubProject(
    displayName,
    fromAmountString(amount).toString(),
    description,
    currency,
    location.pathname.split("/")[2]
  );
  onDialogCancel();
  storeSnackBarMessage(strings.common.added + " " + displayName);
  showSnackBar();
};

const handleEdit = props => {
  const {
    editSubproject,
    onDialogCancel,
    showSnackBar,
    subProjects,
    storeSnackBarMessage,
    subprojectToAdd,
    location
  } = props;

  const { id, displayName } = subprojectToAdd;
  const originalSubproject = subProjects.find(subproject => subproject.data.id === id);
  const changes = compareObjects(subprojectToAdd, originalSubproject.data);
  const projectId = location.pathname.split("/")[2];
  if (!_isEmpty(changes)) {
    if (changes.amount) {
      changes.amount = fromAmountString(changes.amount).toString();
    }
    editSubproject(projectId, id, changes);
    storeSnackBarMessage(strings.common.added + " " + displayName);
    showSnackBar();
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
    creationDialogShown
  } = props;
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
        (_isEmpty(subprojectToAdd.amount) || !_isNumber(parseFloat(subprojectToAdd.amount)))
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
