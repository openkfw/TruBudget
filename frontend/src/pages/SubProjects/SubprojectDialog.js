import React, { useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import SubprojectDialogContent from "./SubprojectDialogContent";
import { compareObjects, fromAmountString, shortenedDisplayName, isEmptyDeep } from "../../helper";

const handleCreate = props => {
  const { createSubProject, onDialogCancel, subprojectToAdd, location, storeSnackbarMessage } = props;
  const { displayName, description, currency, validator, workflowitemType, projectedBudgets } = subprojectToAdd;
  createSubProject(
    displayName,
    description,
    currency,
    validator,
    workflowitemType,
    location.pathname.split("/")[2],
    projectedBudgets.map(b => ({ ...b, value: fromAmountString(b.value).toString(10) }))
  );
  onDialogCancel();

  storeSnackbarMessage(strings.formatString(strings.snackbar.permissions_warning, shortenedDisplayName(displayName)));
};

const handleEdit = props => {
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
      strings.formatString(strings.snackbar.update_succeed_message, shortenedDisplayName(subprojectToAdd.displayName))
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
    subProjects,
    storeSubProjectValidator,
    storeFixedWorkflowitemType
  } = props;

  useEffect(() => {
    if (editDialogShown) {
      // Copy not changeable subproject data to subprojectToAdd to keep comparing consistent
      const selectedSubproject = subProjects.find(s => s.data.id === subprojectToAdd.id).data;
      storeSubProjectValidator(selectedSubproject.validator);
      storeFixedWorkflowitemType(selectedSubproject.workflowitemType);
    }
  }, [editDialogShown, subProjects, subprojectToAdd, storeSubProjectValidator, storeFixedWorkflowitemType]);

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
      content: <SubprojectDialogContent {...props} />,
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

export default SubprojectDialog;
