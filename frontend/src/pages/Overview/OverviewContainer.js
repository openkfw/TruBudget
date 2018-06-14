import React, { Component } from "react";
import { connect } from "react-redux";

import {
  fetchAllProjects,
  createProject,
  storeProjectName,
  storeProjectAmount,
  storeProjectComment,
  storeProjectCurrency,
  setCurrentStep,
  storeProjectThumbnail,
  showCreationDialog,
  hideCreationDialog,
  showEditDialog,
  hideEditDialog,
  editProject,
  showProjectPermissions
} from "./actions";
import ProjectEdit from "./ProjectEdit";

import Overview from "./Overview";
import { showSnackBar, storeSnackBarMessage } from "../Notifications/actions";
import globalStyles from "../../styles";
import { toJS } from "../../helper";

import ProjectPermissionsContainer from "./ProjectPermissionsContainer";

class OverviewContainer extends Component {
  componentWillMount() {
    this.props.fetchAllProjects(true);
  }

  render() {
    return (
      <div id="overviewpage">
        <div style={globalStyles.innerContainer}>
          <Overview {...this.props} />

          <ProjectPermissionsContainer {...this.props} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createProject: (name, amount, comment, currency, _, thumbnail) =>
      dispatch(createProject(name, amount, comment, currency, thumbnail)),
    editProject: (id, changes) => dispatch(editProject(id, changes)),
    showCreationDialog: () => dispatch(showCreationDialog()),
    hideCreationDialog: () => dispatch(hideCreationDialog()),
    showEditDialog: (id, displayName, amount, currency, description, thumbnail) =>
      dispatch(showEditDialog(id, displayName, amount, currency, description, thumbnail)),
    hideEditDialog: () => dispatch(hideEditDialog()),
    storeProjectName: name => dispatch(storeProjectName(name)),
    storeProjectAmount: amount => dispatch(storeProjectAmount(amount)),
    storeProjectComment: comment => dispatch(storeProjectComment(comment)),
    storeProjectCurrency: currency => dispatch(storeProjectCurrency(currency)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: message => dispatch(storeSnackBarMessage(message)),
    setCurrentStep: step => dispatch(setCurrentStep(step)),
    storeProjectThumbnail: thumbnail => dispatch(storeProjectThumbnail(thumbnail)),
    fetchAllProjects: showLoading => dispatch(fetchAllProjects(showLoading)),
    showProjectPermissions: id => dispatch(showProjectPermissions(id))
  };
};

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    creationDialogShown: state.getIn(["overview", "creationDialogShown"]),
    editDialogShown: state.getIn(["overview", "editDialogShown"]),
    currentStep: state.getIn(["overview", "currentStep"]),
    projectToAdd: state.getIn(["overview", "projectToAdd"]),

    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(OverviewContainer));
