import React from "react";

import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import ProjectCreationContent from "./ProjectCreationContent";

const extractRole = roles => _map(roles, role => role.role);

const handleSubmit = props => {
  const {
    createProject,
    onDialogCancel,
    showSnackBar,
    storeSnackBarMessage,
    displayName,
    amount,
    description,
    currency,
    thumbnail,
    projectApprover,
    projectAssignee,
    projectBank,
    location
  } = props;
  const approvers = extractRole(projectApprover);
  const assignees = extractRole(projectAssignee);
  const banks = extractRole(projectBank);
  createProject(
    displayName,
    amount,
    description,
    currency,
    location.pathname.split("/")[2],
    approvers,
    assignees,
    banks,
    thumbnail
  );
  onDialogCancel();
  storeSnackBarMessage(strings.common.added + " " + displayName);
  showSnackBar();
};

const ProjectCreation = props => {
  const steps = [
    {
      title: strings.project.project_details,
      content: <ProjectCreationContent {...props} />,
      nextDisabled: _isEmpty(props.displayName) || _isEmpty(props.description) || !_isNumber(props.amount)
    }
  ];
  return (
    <CreationDialog
      title={strings.project.add_new_project}
      onDialogCancel={props.onProjectDialogCancel}
      steps={steps}
      numberOfSteps={steps.length}
      creationDialogShown={props.dialogShown}
      handleSubmit={handleSubmit}
      {...props}
    />
  );
};

export default ProjectCreation;
