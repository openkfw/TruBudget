import React, { Component } from "react";
import { connect } from "react-redux";

import {
  fetchAllProjectDetails,
  showSubprojectDialog,
  onSubprojectDialogCancel,
  storeSubProjectCurrency,
  createSubProject,
  storeSubProjectName,
  storeSubProjectAmount,
  storeSubProjectComment,
  showProjectPermissions,
  showProjectAssignees,
  fetchProjectHistory
} from "./actions";

import SubProjects from "./SubProjects";
import { showSnackBar, storeSnackBarMessage, showHistory, hideHistory } from "../Notifications/actions";
import { setSelectedView } from "../Navbar/actions";
import ProjectDetails from "./ProjectDetails";
import globalStyles from "../../styles";
import { toJS } from "../../helper";
import ProjectPermissionsContainer from "./ProjectPermissionsContainer";
import strings from "../../localizeStrings";
import { fetchUser } from "../Login/actions";
import ProjectHistoryContainer from "./ProjectHistoryContainer";

class SubProjectsContainer extends Component {
  componentWillMount() {
    const projectId = this.props.location.pathname.split("/")[2];
    this.props.setSelectedView(projectId, "project");
    this.props.fetchAllProjectDetails(projectId, true);
    this.props.fetchUser();
  }

  render() {
    const canViewPermissions = this.props.allowedIntents.indexOf("project.intent.listPermissions") > -1;
    const canCreateSubProject = this.props.allowedIntents.indexOf("project.createSubproject") > -1;
    const canAssignProject = this.props.allowedIntents.indexOf("project.assign") > -1;
    return (
      <div>
        <div style={globalStyles.innerContainer}>
          <ProjectPermissionsContainer title={strings.project.project_permissions_title} />
          <ProjectDetails {...this.props} canViewPermissions={canViewPermissions} canAssignProject={canAssignProject} />
          <SubProjects {...this.props} canCreateSubProject={canCreateSubProject} />
          <ProjectHistoryContainer />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllProjectDetails: (projectId, showLoading) => dispatch(fetchAllProjectDetails(projectId, showLoading)),
    showSubprojectDialog: () => dispatch(showSubprojectDialog()),
    onSubprojectDialogCancel: () => dispatch(onSubprojectDialogCancel()),
    storeSubProjectName: name => dispatch(storeSubProjectName(name)),
    createSubProject: (subprojectName, amount, comment, currency, parentName) =>
      dispatch(createSubProject(parentName, subprojectName, amount, comment, currency)),
    storeSubProjectAmount: amount => dispatch(storeSubProjectAmount(amount)),
    storeSubProjectComment: comment => dispatch(storeSubProjectComment(comment)),
    storeSubProjectCurrency: currency => dispatch(storeSubProjectCurrency(currency)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: message => dispatch(storeSnackBarMessage(message)),
    openHistory: projectId => {
      dispatch(fetchProjectHistory(projectId, true));
      dispatch(showHistory());
    },
    hideHistory: () => dispatch(hideHistory()),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    showProjectPermissions: () => dispatch(showProjectPermissions()),
    showProjectAssignees: () => dispatch(showProjectAssignees()),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

const mapStateToProps = state => {
  return {
    users: state.getIn(["login", "user"]),
    projectId: state.getIn(["detailview", "id"]),
    projectName: state.getIn(["detailview", "projectName"]),
    projectAmount: state.getIn(["detailview", "projectAmount"]),
    projectComment: state.getIn(["detailview", "projectComment"]),
    projectCurrency: state.getIn(["detailview", "projectCurrency"]),
    projectStatus: state.getIn(["detailview", "projectStatus"]),
    projectTS: state.getIn(["detailview", "projectTS"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    subprojectsDialogVisible: state.getIn(["detailview", "subprojectsDialogVisible"]),
    subProjectName: state.getIn(["detailview", "subProjectName"]),
    showProjectAssignees: state.getIn(["detailview", "showProjectAssignees"]),
    subProjectAmount: state.getIn(["detailview", "subProjectAmount"]),
    subProjectComment: state.getIn(["detailview", "subProjectComment"]),
    subProjectCurrency: state.getIn(["detailview", "subProjectCurrency"]),
    showHistory: state.getIn(["notifications", "showHistory"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"]),
    user: state.getIn(["login", "user"]),
    allowedIntents: state.getIn(["detailview", "allowedIntents"]),
    thumbnail: state.getIn(["detailview", "thumbnail"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubProjectsContainer));
