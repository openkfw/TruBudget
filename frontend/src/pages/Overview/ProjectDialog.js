import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import ProjectDialogContent from "./ProjectDialogContent";
import { compareObjects, fromAmountString } from "../../helper";

const handleCreate = props => {
  const { createProject, onDialogCancel, projectToAdd, location, storeSnackbarMessage } = props;
  const { displayName, amount, description, currency, thumbnail, projectedBudgets } = projectToAdd;
  createProject(
    displayName,
    fromAmountString(amount).toString(),
    description,
    currency,
    location.pathname.split("/")[2],
    thumbnail,
    projectedBudgets
  );
  onDialogCancel();
  storeSnackbarMessage(strings.common.added + " " + strings.common.project + " " + displayName);
};

const handleEdit = props => {
  const { editProject, onDialogCancel, projectToAdd, projects, storeSnackbarMessage } = props;

  const changes = compareObjects(projects, projectToAdd);

  if (!_isEmpty(changes)) {
    // TODO: Fix changes object when editing projectedBudget is enabled
    editProject(projectToAdd.id, {
      displayName: changes.displayName,
      description: changes.description,
      thumbnail: changes.thumbnail
    });
    storeSnackbarMessage(strings.common.edited + " " + strings.common.project + " " + projectToAdd.displayName);
  }
  onDialogCancel();
};

const ProjectDialog = props => {
  const { projects, projectToAdd, editDialogShown, creationDialogShown } = props;
  const { displayName, description, projectedBudgets } = projectToAdd;
  const changes = compareObjects(projects, projectToAdd);
  const specificProps = props.editDialogShown
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
      content: <ProjectDialogContent {...props} />,
      nextDisabled:
        _isEmpty(displayName) ||
        _isEmpty(description) ||
        ((projectedBudgets.length === 0 && !editDialogShown) || _isEmpty(changes))
      // ((_isEmpty(amount) && isNaN(parseFloat(amount)) && projectedBudgets.length === 0) || _isEmpty(changes))
    }
  ];

  return (
    <CreationDialog
      steps={steps}
      title={props.dialogTitle}
      numberOfSteps={steps.length}
      onDialogCancel={props.hideProjectDialog}
      editDialogShown={props.editDialogShown}
      {...specificProps}
      {...props}
    />
  );
};

export default ProjectDialog;
