import React from "react";

import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import ProjectCreationContent from "./ProjectCreationContent";

const handleSubmit = props => {
  const { createProject, onDialogCancel, projectToAdd, showSnackBar, storeSnackBarMessage, location } = props;
  const { displayName, amount, description, currency, thumbnail } = projectToAdd;
  createProject(displayName, amount, description, currency, location.pathname.split("/")[2], thumbnail);
  onDialogCancel();
  storeSnackBarMessage(strings.common.added + " " + displayName);
  showSnackBar();
};

const ProjectCreation = props => {
  const { displayName, description, amount } = props.projectToAdd;
  const steps = [
    {
      title: strings.project.project_details,
      content: <ProjectCreationContent {...props} />,
      nextDisabled: _isEmpty(displayName) || _isEmpty(description) || !_isNumber(amount)
    }
  ];
  return (
    <CreationDialog
      title={strings.project.add_new_project}
      onDialogCancel={props.hideCreationDialog}
      steps={steps}
      numberOfSteps={steps.length}
      dialogShown={props.creationDialogShown}
      handleSubmit={handleSubmit}
      {...props}
    />
  );
};

export default ProjectCreation;
