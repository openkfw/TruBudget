import React, { useEffect } from "react";
import _isEmpty from "lodash/isEmpty";

import { compareObjects, fromAmountString, isEmptyDeep, shortenedDisplayName, trimSpecialChars } from "../../helper";
import strings from "../../localizeStrings";
import CreationDialog from "../Common/CreationDialog";

import SubProjectDialogContent from "./SubProjectDialogContent";

const handleCreate = (props) => {
  const {
    createSubProject,
    onDialogCancel,
    projectDisplayName,
    subprojectToAdd,
    location,
    storeSnackbarMessage,
    users
  } = props;
  const { displayName, description, currency, workflowitemType, workflowMode, projectedBudgets } = subprojectToAdd;
  const projectId = location.pathname.split("/")[2];
  const validator = {
    id: subprojectToAdd.validator,
    displayName: users.find((u) => u.id === subprojectToAdd.validator)?.displayName
  };

  createSubProject({
    projectId,
    projectDisplayName,
    subprojectDisplayName: displayName,
    description,
    currency,
    validator,
    workflowitemType,
    workflowMode,
    projectedBudgets: projectedBudgets.map((b) => ({ ...b, value: fromAmountString(b.value).toString(10) }))
  });
  onDialogCancel();

  storeSnackbarMessage(
    strings.formatString(strings.snackbar.permissions_warning, shortenedDisplayName(trimSpecialChars(displayName)))
  );
};

const handleEdit = (props) => {
  const { editSubproject, onDialogCancel, subProjects, subprojectToAdd, location, storeSnackbarMessage } = props;
  const changes = compareObjects(subProjects, subprojectToAdd);
  const hasChanges = !isEmptyDeep(changes);
  const projectId = location.pathname.split("/")[2];
  if (hasChanges) {
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
      strings.formatString(
        strings.snackbar.update_succeed_message,
        shortenedDisplayName(trimSpecialChars(subprojectToAdd.displayName))
      )
    );
  }

  onDialogCancel();
};

const SubProjectDialog = (props) => {
  const {
    subprojectToAdd,
    dialogTitle,
    createDialogShown,
    hideSubprojectDialog,
    editDialogShown,
    creationDialogShown,
    subProjects,
    storeSubProjectValidator,
    storeFixedWorkflowitemType,
    storeWorkflowMode
  } = props;

  useEffect(() => {
    if (editDialogShown) {
      // Copy not changeable subproject data to subprojectToAdd to keep comparing consistent
      const selectedSubproject = subProjects.find((s) => s.data.id === subprojectToAdd.id).data;
      storeSubProjectValidator(selectedSubproject.validator);
      storeFixedWorkflowitemType(selectedSubproject.workflowitemType);
      storeWorkflowMode(selectedSubproject.workflowMode);
    }
  }, [
    editDialogShown,
    subProjects,
    subprojectToAdd,
    storeSubProjectValidator,
    storeFixedWorkflowitemType,
    storeWorkflowMode
  ]);

  const changes = compareObjects(subProjects, subprojectToAdd);
  const hasChanges = !isEmptyDeep(changes);

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
      content: <SubProjectDialogContent {...props} />,
      nextDisabled: _isEmpty(subprojectToAdd.displayName) || _isEmpty(subprojectToAdd.currency) || !hasChanges
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

export default SubProjectDialog;
