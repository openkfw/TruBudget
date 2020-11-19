import _isEmpty from "lodash/isEmpty";
import React from "react";

import { compareObjects, fromAmountString, shortenedDisplayName, isEmptyDeep } from "../../helper";
import strings from "../../localizeStrings";
import CreationDialog from "../Common/CreationDialog";
import ProjectDialogContent from "./ProjectDialogContent";

const handleCreate = props => {
  const { createProject, onDialogCancel, projectToAdd, storeSnackbarMessage } = props;
  const { displayName, description, thumbnail, projectedBudgets, tags } = projectToAdd;
  createProject(
    displayName,
    description,
    thumbnail,
    projectedBudgets.map(b => ({ ...b, value: fromAmountString(b.value).toString(10) })),
    tags
  );
  onDialogCancel();
  storeSnackbarMessage(
    strings.formatString(strings.snackbar.creation_succeed_message, shortenedDisplayName(displayName))
  );
};

const handleEdit = props => {
  const { editProject, onDialogCancel, projectToAdd, projects, storeSnackbarMessage } = props;

  const changes = compareObjects(projects, projectToAdd);
  const hasChanges = !isEmptyDeep(changes);

  if (hasChanges) {
    editProject(
      projectToAdd.id,
      {
        displayName: changes.displayName,
        description: changes.description,
        thumbnail: changes.thumbnail,
        projectedBudgets: changes.projectedBudgets,
        additionalData: changes.additionalData,
        tags: changes.tags
      },
      changes.deletedProjectedBudgets
    );
    console.log();
    storeSnackbarMessage(
      strings.formatString(strings.snackbar.update_succeed_message, shortenedDisplayName(projectToAdd.displayName))
    );
  }
  onDialogCancel();
};

const ProjectDialog = props => {
  const { projects, projectToAdd, editDialogShown, creationDialogShown } = props;
  const { displayName } = projectToAdd;
  const changes = compareObjects(projects, projectToAdd);
  const hasChanges = !isEmptyDeep(changes);

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
      nextDisabled: _isEmpty(displayName) || (!hasChanges && editDialogShown)
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
