import React from "react";

import _isEmpty from "lodash/isEmpty";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import ProjectDialogContent from "./ProjectDialogContent";
import { compareObjects, fromAmountString } from "../../helper";

const handleCreate = props => {
  const { createProject, onDialogCancel, projectToAdd, location, storeSnackbarMessage } = props;
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
};

const handleEdit = props => {
  const { editProject, onDialogCancel, projectToAdd, projects, storeSnackbarMessage } = props;

  const changes = compareObjects(projects, projectToAdd);

  if (!_isEmpty(changes)) {
    if (changes.amount) {
      changes.amount = fromAmountString(changes.amount).toString();
    }
    editProject(projectToAdd.id, changes);
    storeSnackbarMessage(strings.common.edited + " " + strings.common.project + " " + projectToAdd.displayName);
  }
  onDialogCancel();
};

const ProjectDialog = props => {
  const { projects, projectToAdd, editDialogShown, creationDialogShown } = props;
  const { displayName, description, amount } = projectToAdd;
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
        ((_isEmpty(amount) && isNaN(parseFloat(amount))) || _isEmpty(changes))
    }
  ];

  return (
    <CreationDialog
      steps={steps}
      title={props.dialogTitle}
      numberOfSteps={steps.length}
      onDialogCancel={props.hideProjectDialog}
      {...specificProps}
      {...props}
    />
  );
};

export default ProjectDialog;
