import React from "react";

import _isEmpty from "lodash/isEmpty";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import SubProjectCreationContent from "./SubProjectCreationContent";

const handleSubmit = props => {
  const { createSubProject, onDialogCancel, subprojectToAdd, showSnackBar, storeSnackBarMessage, location } = props;
  const { displayName, amount, description, currency } = subprojectToAdd;
  createSubProject(displayName, amount, description, currency, location.pathname.split("/")[2]);
  onDialogCancel();
  storeSnackBarMessage(strings.common.added + " " + displayName);
  showSnackBar();
};

const SubProjectCreation = props => {
  const { subprojectToAdd } = props;
  const steps = [
    {
      title: strings.project.project_details,
      content: <SubProjectCreationContent {...props} />,
      nextDisabled:
        _isEmpty(subprojectToAdd.displayName) ||
        _isEmpty(subprojectToAdd.description) ||
        !_isNumber(subprojectToAdd.amount)
    }
  ];
  return (
    <CreationDialog
      title={strings.subproject.subproject_add}
      dialogShown={props.createDialogShown}
      onDialogCancel={props.onSubprojectDialogCancel}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props}
    />
  );
};

export default SubProjectCreation;
