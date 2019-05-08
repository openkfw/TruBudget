import React, { Component } from "react";
import { connect } from "react-redux";
import SubprojectDialog from "./SubprojectDialog";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import {
  hideSubprojectDialog,
  storeSubProjectName,
  createSubProject,
  editSubproject,
  storeSubProjectComment,
  storeSubProjectCurrency,
  storeSubProjectProjectedBudgets,
  storeDeletedProjectedBudget
} from "./actions";
import { storeSnackbarMessage } from "../Notifications/actions";

class SubprojectDialogContainer extends Component {
  render() {
    return <SubprojectDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    subprojectToAdd: state.getIn(["detailview", "subprojectToAdd"]),
    creationDialogShown: state.getIn(["detailview", "creationDialogShown"]),
    editDialogShown: state.getIn(["detailview", "editDialogShown"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    dialogTitle: state.getIn(["detailview", "dialogTitle"]),
    projectProjectedBudgets: state.getIn(["detailview", "projectProjectedBudgets"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideSubprojectDialog: () => dispatch(hideSubprojectDialog()),
    storeSubProjectName: name => dispatch(storeSubProjectName(name)),
    createSubProject: (subprojectName, description, currency, parentName, projectedBudget) =>
      dispatch(createSubProject(parentName, subprojectName, description, currency, projectedBudget)),
    editSubproject: (pId, sId, changes, deletedBudgets) => dispatch(editSubproject(pId, sId, changes, deletedBudgets)),
    storeSubProjectComment: comment => dispatch(storeSubProjectComment(comment)),
    storeSubProjectCurrency: currency => dispatch(storeSubProjectCurrency(currency)),
    storeSubProjectProjectedBudgets: projectedBudgets => dispatch(storeSubProjectProjectedBudgets(projectedBudgets)),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    storeDeletedProjectedBudget: projectedBudgets => dispatch(storeDeletedProjectedBudget(projectedBudgets))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubprojectDialogContainer)));
