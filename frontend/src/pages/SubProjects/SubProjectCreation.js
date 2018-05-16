import React from "react";

import _isEmpty from "lodash/isEmpty";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import SubProjectCreationContent from "./SubProjectCreationContent";

const handleSubmit = props => {
  const {
    createSubProject,
    onDialogCancel,
    showSnackBar,
    storeSnackBarMessage,
    subProjectName,
    subProjectAmount,
    subProjectComment,
    subProjectCurrency,
    location
  } = props;
  createSubProject(
    subProjectName,
    subProjectAmount,
    subProjectComment,
    subProjectCurrency,
    location.pathname.split("/")[2]
  );
  onDialogCancel();
  storeSnackBarMessage(strings.common.added + " " + subProjectName);
  showSnackBar();
};

const SubProjectCreation = props => {
  const steps = [
    {
      title: strings.project.project_details,
      content: <SubProjectCreationContent {...props} />,
      nextDisabled:
        _isEmpty(props.subProjectName) || _isEmpty(props.subProjectComment) || !_isNumber(props.subProjectAmount)
    }
  ];
  return (
    <CreationDialog
      title={strings.subproject.subproject_add}
      creationDialogShown={props.subprojectsDialogVisible}
      onDialogCancel={props.onSubprojectDialogCancel}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props}
    />
  );
};

export default SubProjectCreation;
