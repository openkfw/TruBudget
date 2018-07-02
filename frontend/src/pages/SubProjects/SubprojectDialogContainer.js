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
  storeSubProjectAmount,
  storeSubProjectComment,
  storeSubProjectCurrency
} from "./actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";

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
    projectCurrency: state.getIn(["detailview", "projectCurrency"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideSubprojectDialog: () => dispatch(hideSubprojectDialog()),
    storeSubProjectName: name => dispatch(storeSubProjectName(name)),
    createSubProject: (subprojectName, amount, description, currency, parentName) =>
      dispatch(createSubProject(parentName, subprojectName, amount, description, currency)),
    editSubproject: (pId, sId, changes) => dispatch(editSubproject(pId, sId, changes)),
    storeSubProjectAmount: amount => dispatch(storeSubProjectAmount(amount)),
    storeSubProjectComment: comment => dispatch(storeSubProjectComment(comment)),
    storeSubProjectCurrency: currency => dispatch(storeSubProjectCurrency(currency)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubprojectDialogContainer)));
