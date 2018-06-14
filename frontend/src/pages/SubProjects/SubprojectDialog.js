import React from "react";

import _isEmpty from "lodash/isEmpty";
import _isNumber from "lodash/isNumber";

import CreationDialog from "../Common/CreationDialog";
import strings from "../../localizeStrings";
import SubprojectDialogContent from "./SubprojectDialogContent";
import { compareObjects } from "../../helper";

const handleCreate = props => {
  const { createSubProject, onDialogCancel, subprojectToAdd, showSnackBar, storeSnackBarMessage, location } = props;
  const { displayName, amount, description, currency } = subprojectToAdd;
  createSubProject(displayName, amount, description, currency, location.pathname.split("/")[2]);
  onDialogCancel();
  storeSnackBarMessage(strings.common.added + " " + displayName);
  showSnackBar();
};

const handleEdit = props => {
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

const SubprojectDialog = props => {
  const { subprojectToAdd } = props;
  const specifcProps = props.editDialogShown
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
      content: <SubprojectDialogContent {...props} />,
      nextDisabled:
        _isEmpty(subprojectToAdd.displayName) ||
        _isEmpty(subprojectToAdd.description) ||
        !_isNumber(subprojectToAdd.amount)
    }
  ];
  return (
    <CreationDialog
      steps={steps}
      title={strings.subproject.subproject_add}
      numberOfSteps={steps.length}
      dialogShown={props.createDialogShown}
      onDialogCancel={props.hideSubprojectDialog}
      {...specifcProps}
      {...props}
    />
  );
};

export default SubprojectDialog;
