import React from "react";

import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import _isNumber from "lodash/isNumber";
import { compareObjects } from "../../helper";
import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import ProjectCreationContent from "./ProjectCreationContent";

const handleSubmit = props => {
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

const ProjectEdit = props => {
  const { displayName, description, amount } = props.projectToAdd;
  const steps = [
    {
      content: <ProjectCreationContent {...props} />,
      nextDisabled: _isEmpty(displayName) || _isEmpty(description) || !_isNumber(amount)
    }
  ];

  return (
    <CreationDialog
      title={"Edit Project"}
      onDialogCancel={props.hideEditDialog}
      steps={steps}
      numberOfSteps={steps.length}
      dialogShown={props.editDialogShown}
      handleSubmit={handleSubmit}
      {...props}
    />
  );
};

export default ProjectEdit;
