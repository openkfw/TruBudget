import React from "react";

import _isEmpty from "lodash/isEmpty";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import SubProjectCreationContent from "./SubProjectCreationContent";
import { compareObjects } from "../../helper";

const handleSubmit = props => {
  const {
    editSubproject,
    onDialogCancel,
    showSnackBar,
    subProjects,
    storeSnackBarMessage,
    subprojectToAdd,
    location
  } = props;

  const { id, displayName, comment, amount, currency } = subprojectToAdd;
  const originalSubproject = subProjects.find(subproject => subproject.data.id === id);
  const changes = compareObjects(subprojectToAdd, originalSubproject.data);
  const projectId = location.pathname.split("/")[2];
  if (!_isEmpty(changes)) {
    editSubproject(projectId, id, changes);
    storeSnackBarMessage(strings.common.added + " " + displayName);
    showSnackBar();
  }

  onDialogCancel();
};

const SubprojectEdit = props => {
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
      title={"Edit Subproject"}
      dialogShown={props.editDialogShown}
      onDialogCancel={props.hideEditDialog}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props}
    />
  );
};

export default SubprojectEdit;
