import React, { Component } from "react";
import { connect } from "react-redux";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";

import ProjectDialog from "./ProjectDialog";
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
} from "./actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";

class ProjectDialogContainer extends Component {
  render() {
    return <ProjectDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    creationDialogShown: state.getIn(["overview", "creationDialogShown"]),
    editDialogShown: state.getIn(["overview", "editDialogShown"]),
    currentStep: state.getIn(["overview", "currentStep"]),
    projectToAdd: state.getIn(["overview", "projectToAdd"]),
    dialogTitle: state.getIn(["overview", "dialogTitle"]),
    allowedIntents: state.getIn(["login", "allowedIntents"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createProject: (name, amount, comment, currency, _, thumbnail) =>
      dispatch(createProject(name, amount, comment, currency, thumbnail)),
    editProject: (id, changes) => dispatch(editProject(id, changes)),
    hideProjectDialog: () => dispatch(hideProjectDialog()),
    storeProjectName: name => dispatch(storeProjectName(name)),
    storeProjectAmount: amount => dispatch(storeProjectAmount(amount)),
    storeProjectComment: comment => dispatch(storeProjectComment(comment)),
    storeProjectCurrency: currency => dispatch(storeProjectCurrency(currency)),
    setCurrentStep: step => dispatch(setCurrentStep(step)),
    storeProjectThumbnail: thumbnail => dispatch(storeProjectThumbnail(thumbnail)),

    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(ProjectDialogContainer)));
