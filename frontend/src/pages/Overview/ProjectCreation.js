import React from "react";

import _isEmpty from "lodash/isEmpty";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import ProjectCreationContent from "./ProjectCreationContent";
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
  const { editProject, onDialogCancel, showSnackBar, storeSnackBarMessage, projectToAdd, location, projects } = props;
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

const ProjectCreation = props => {
  const { displayName, description, amount } = props.projectToAdd;

  const specificProps = props.editDialogShown
    ? {
        title: "Edit Project",
        onDialogCancel: props.hideEditDialog,
        handleSubmit: handleEdit
      }
    : {
        title: strings.project.add_new_project,
        onDialogCancel: props.hideCreationDialog,
        handleSubmit: handleCreate
      };

  const steps = [
    {
      title: strings.project.project_details,
      content: <ProjectCreationContent {...props} />,
      nextDisabled: _isEmpty(displayName) || _isEmpty(description) || !_isNumber(amount)
    }
  ];
  return (
    <CreationDialog
      steps={steps}
      numberOfSteps={steps.length}
      dialogShown={props.creationDialogShown || props.editDialogShown}
      {...specificProps}
      {...props}
    />
  );
};

export default ProjectCreation;
