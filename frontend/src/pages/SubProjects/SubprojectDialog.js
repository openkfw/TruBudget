import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import SubprojectDialogContent from "./SubprojectDialogContent";
import { compareObjects, fromAmountString, shortenedDisplayName } from "../../helper";

const handleCreate = props => {
  const { createSubProject, onDialogCancel, subprojectToAdd, location, storeSnackbarMessage } = props;
  const { displayName, description, currency, projectedBudgets } = subprojectToAdd;
  createSubProject(
    displayName,
    description,
    currency,
    location.pathname.split("/")[2],
    projectedBudgets.map(b => ({ ...b, value: fromAmountString(b.value).toString(10) }))
  );
  onDialogCancel();
  storeSnackbarMessage(strings.subproject.subproject_permissions_warning + " " + shortenedDisplayName(displayName));
};

const handleEdit = props => {
  const { editSubproject, onDialogCancel, subProjects, subprojectToAdd, location, storeSnackbarMessage } = props;
  const changes = compareObjects(subProjects, subprojectToAdd);
  const projectId = location.pathname.split("/")[2];
  if (!_isEmpty(changes)) {
    editSubproject(
      projectId,
      subprojectToAdd.id,
      {
        displayName: changes.displayName,
        description: changes.description,
        projectedBudgets: changes.projectedBudgets
      },
      changes.deletedProjectedBudgets
    );
    storeSnackbarMessage(
      strings.common.edited + " " + strings.common.subproject + " " + shortenedDisplayName(subprojectToAdd.displayName)
    );
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
      nextDisabled: _isEmpty(subprojectToAdd.displayName) || _isEmpty(subprojectToAdd.currency) || _isEmpty(changes)
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
        editDialogShown={editDialogShown}
        {...specifcProps}
        {...props}
      />
    </div>
  );
};

export default SubprojectDialog;
