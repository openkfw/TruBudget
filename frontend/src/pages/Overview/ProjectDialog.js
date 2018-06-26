import React from "react";

import _isEmpty from "lodash/isEmpty";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import ProjectDialogContent from "./ProjectDialogContent";
import { compareObjects } from "../../helper";

const handleCreate = props => {
  const { createProject, onDialogCancel, projectToAdd, showSnackBar, storeSnackBarMessage, location } = props;
  const { displayName, amount, description, currency, thumbnail } = projectToAdd;
  createProject(displayName, amount, description, currency, location.pathname.split("/")[2], thumbnail);
  onDialogCancel();
  storeSnackBarMessage(strings.common.added + " " + displayName);
  showSnackBar();
};

const handleEdit = props => {
  const { editProject, onDialogCancel, showSnackBar, storeSnackBarMessage, projectToAdd, projects } = props;
  const { displayName, id } = projectToAdd;
  const originalProject = projects.find(project => project.data.id === id);
  const changes = compareObjects(projectToAdd, originalProject.data);
  if (!_isEmpty(changes)) {
    editProject(id, changes);
    storeSnackBarMessage(strings.common.added + " " + displayName);
    showSnackBar();
  }
  onDialogCancel();
};

const ProjectDialog = props => {
  const { displayName, description, amount } = props.projectToAdd;

  const specificProps = props.editDialogShown
    ? {
        handleSubmit: handleEdit,
        dialogShown: props.editDialogShown
      }
    : {
        handleSubmit: handleCreate,
        dialogShown: props.creationDialogShown
      };

  const steps = [
    {
      title: strings.project.project_details,
      content: <ProjectDialogContent {...props} />,
      nextDisabled: _isEmpty(displayName) || _isEmpty(description) || !_isNumber(amount)
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
