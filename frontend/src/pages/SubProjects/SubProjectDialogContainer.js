import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import withInitialLoading from "../Loading/withInitialLoading";
import { storeSnackbarMessage } from "../Notifications/actions";

import {
  addSubProjectProjectedBudget,
  createSubProject,
  editSubproject,
  editSubProjectProjectedBudgetAmount,
  hideSubprojectDialog,
  storeDeletedProjectedBudget,
  storeFixedWorkflowitemType,
  storeSubProjectComment,
  storeSubProjectCurrency,
  storeSubProjectName,
  storeSubProjectValidator,
  storeWorkflowMode
} from "./actions";
import SubProjectDialog from "./SubProjectDialog";

class SubProjectDialogContainer extends Component {
  render() {
    return <SubProjectDialog {...this.props} />;
  }
}

const mapStateToProps = (state) => {
  return {
    subprojectToAdd: state.getIn(["detailview", "subprojectToAdd"]),
    creationDialogShown: state.getIn(["detailview", "creationDialogShown"]),
    editDialogShown: state.getIn(["detailview", "editDialogShown"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    dialogTitle: state.getIn(["detailview", "dialogTitle"]),
    projectProjectedBudgets: state.getIn(["detailview", "projectProjectedBudgets"]),
    users: state.getIn(["login", "enabledUsers"]),
    selectedValidator: state.getIn(["detailview", "subprojectToAdd", "validator"]),
    selectedWorkflowitemType: state.getIn(["detailview", "subprojectToAdd", "workflowitemType"]),
    currentUser: state.getIn(["login", "id"]),
    projectDisplayName: state.getIn(["detailview", "projectName"])
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideSubprojectDialog: () => dispatch(hideSubprojectDialog()),
    storeSubProjectName: (name) => dispatch(storeSubProjectName(name)),
    createSubProject: ({
      projectId,
      projectDisplayName,
      subprojectDisplayName,
      description,
      currency,
      validator,
      workflowitemType,
      workflowMode,
      projectedBudgets
    }) =>
      dispatch(
        createSubProject({
          projectId,
          projectDisplayName,
          subprojectDisplayName,
          description,
          currency,
          validator,
          workflowitemType,
          workflowMode,
          projectedBudgets
        })
      ),
    editSubproject: (pId, sId, changes, deletedBudgets) => dispatch(editSubproject(pId, sId, changes, deletedBudgets)),
    storeSubProjectComment: (comment) => dispatch(storeSubProjectComment(comment)),
    storeSubProjectCurrency: (currency) => dispatch(storeSubProjectCurrency(currency)),
    storeSubProjectValidator: (validator) => dispatch(storeSubProjectValidator(validator)),
    addSubProjectProjectedBudget: (projectedBudget) => dispatch(addSubProjectProjectedBudget(projectedBudget)),
    editSubProjectProjectedBudgetAmount: (projectedBudget, budgetAmountEdit) =>
      dispatch(editSubProjectProjectedBudgetAmount(projectedBudget, budgetAmountEdit)),
    storeSnackbarMessage: (message) => dispatch(storeSnackbarMessage(message)),
    storeDeletedProjectedBudget: (projectedBudgets) => dispatch(storeDeletedProjectedBudget(projectedBudgets)),
    storeFixedWorkflowitemType: (workflowitemType) => dispatch(storeFixedWorkflowitemType(workflowitemType)),
    storeWorkflowMode: (workflowMode) => dispatch(storeWorkflowMode(workflowMode))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectDialogContainer)));
