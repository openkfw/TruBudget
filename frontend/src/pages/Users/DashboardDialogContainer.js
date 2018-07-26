import React, { Component } from "react";
import { connect } from "react-redux";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";

import DashboardDialog from "./DashboardDialog";
import {
  createProject,
  editProject,
  hideProjectDialog,
  storeProjectName,
  storeProjectAmount,
  storeProjectComment,
  storeProjectCurrency,
  setCurrentStep,
  storeProjectThumbnail
} from "../Overview/actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import { hideEditDialog } from "../Groups/actions";
import { hideDashboardDialog, createUser } from "./actions";

class DashboardDialogContainer extends Component {
  render() {
    return <DashboardDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    currentStep: state.getIn(["overview", "currentStep"]),
    projectToAdd: state.getIn(["overview", "projectToAdd"]),
    dialogTitle: state.getIn(["overview", "dialogTitle"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    dashboardDialogShown: state.getIn(["users", "dashboardDialogShown"]),
    dialogType: state.getIn(["users", "dialogType"]),
    editId: state.getIn(["users", "editId"])
  };
};

const mapDispatchToProps = dispatch => {
  return {

    //copied from project
    createProject: (name, amount, comment, currency, _, thumbnail) =>
      dispatch(createProject(name, amount, comment, currency, thumbnail)),
    editProject: (id, changes) => dispatch(editProject(id, changes)),
    hideProjectDialog: () => dispatch(hideEditDialog()),
    storeProjectName: name => dispatch(storeProjectName(name)),
    storeProjectAmount: amount => dispatch(storeProjectAmount(amount)),
    storeProjectComment: comment => dispatch(storeProjectComment(comment)),
    storeProjectCurrency: currency => dispatch(storeProjectCurrency(currency)),
    setCurrentStep: step => dispatch(setCurrentStep(step)),
    storeProjectThumbnail: thumbnail => dispatch(storeProjectThumbnail(thumbnail)),

    createUser: (displayName, organization, username, password) =>
      dispatch(createUser(displayName, organization, username, password)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),


    hideDashboardDialog: () => dispatch(hideDashboardDialog())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(DashboardDialogContainer)));
