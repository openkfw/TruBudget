import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import { canAssignProject, canCloseProject, canCreateSubProject } from "../../permissions";
import globalStyles from "../../styles";
import { openAnalyticsDialog } from "../Analytics/actions";
import AdditionalInfo from "../Common/AdditionalInfo";
import LiveUpdates from "../LiveUpdates/LiveUpdates";
import { fetchUser } from "../Login/actions";
import { setSelectedView } from "../Navbar/actions";
import { hideHistory, openHistory } from "../Notifications/actions";
import {
  closeProject,
  fetchAllProjectDetails,
  hideSubProjectAdditionalData,
  liveUpdateProject,
  showEditDialog,
  showProjectAssignees,
  showSubProjectAdditionalData,
  showSubprojectDialog,
  showSubProjectPermissions
} from "./actions";
import ProjectDetails from "./ProjectDetails";
import ProjectHistoryDrawer from "./ProjectHistoryDrawer";
import SubprojectDialogContainer from "./SubprojectDialogContainer";
import SubprojectPermissionsContainer from "./SubprojectPermissionsContainer";
import SubProjects from "./SubProjects";

class SubProjectContainer extends Component {
  constructor(props) {
    super(props);
    this.projectId = this.props.location.pathname.split("/")[2];
  }

  componentWillMount() {
    this.props.setSelectedView(this.projectId, "project");
    this.props.fetchAllProjectDetails(this.projectId, true);
    this.props.fetchUser();
  }

  closeProject = () => {
    const openSubprojects = this.props.subProjects.find(subproject => subproject.data.status === "open");
    if (!openSubprojects) {
      this.props.closeProject(this.projectId);
    }
  };

  update = () => {
    this.props.liveUpdate(this.projectId);
  };

  render() {
    const canCreateSubproject = canCreateSubProject(this.props.allowedIntents) && !this.props.isRoot;
    const canAssign = canAssignProject(this.props.allowedIntents);
    const canClose = canCloseProject(this.props.allowedIntents);
    const projectId = this.projectId;

    return (
      <div>
        <LiveUpdates update={this.update} />
        <div style={globalStyles.innerContainer}>
          <ProjectDetails
            {...this.props}
            projectId={projectId}
            canAssignProject={canAssign}
            closeProject={this.closeProject}
            canClose={canClose}
          />
          <SubProjects {...this.props} projectId={projectId} canCreateSubProject={canCreateSubproject} />
          <ProjectHistoryDrawer projectId={projectId} />
          {this.props.permissionDialogShown ? (
            <SubprojectPermissionsContainer projectId={projectId} subProjects={this.props.subProjects} />
          ) : null}
          <AdditionalInfo
            resources={this.props.subProjects}
            isAdditionalDataShown={this.props.isSubProjectAdditionalDataShown}
            hideAdditionalData={this.props.hideSubProjectAdditionalData}
            {...this.props}
          />
          <SubprojectDialogContainer location={this.props.location} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchAllProjectDetails: (projectId, showLoading) => dispatch(fetchAllProjectDetails(projectId, showLoading)),
    liveUpdate: projectId => dispatch(liveUpdateProject(projectId)),
    showSubprojectDialog: () => dispatch(showSubprojectDialog()),

    openHistory: () => {
      dispatch(openHistory());
    },
    hideHistory: () => dispatch(hideHistory()),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    showProjectAssignees: () => dispatch(showProjectAssignees()),
    showEditDialog: (id, displayName, description, currency, projectedBudgets) =>
      dispatch(showEditDialog(id, displayName, description, currency, projectedBudgets)),
    fetchUser: () => dispatch(fetchUser(true)),
    closeProject: pId => dispatch(closeProject(pId, true)),
    showSubProjectPermissions: (id, displayName) => dispatch(showSubProjectPermissions(id, displayName)),
    showSubProjectAdditionalData: id => dispatch(showSubProjectAdditionalData(id)),
    hideSubProjectAdditionalData: () => dispatch(hideSubProjectAdditionalData()),
    openAnalyticsDialog: () => dispatch(openAnalyticsDialog())
  };
};

const mapStateToProps = state => {
  return {
    users: state.getIn(["login", "user"]),
    projectId: state.getIn(["detailview", "id"]),
    projectName: state.getIn(["detailview", "projectName"]),
    projectComment: state.getIn(["detailview", "projectComment"]),
    projectStatus: state.getIn(["detailview", "projectStatus"]),
    projectAssignee: state.getIn(["detailview", "projectAssignee"]),
    projectTS: state.getIn(["detailview", "projectTS"]),
    projectProjectedBudgets: state.getIn(["detailview", "projectProjectedBudgets"]),
    projectTags: state.getIn(["detailview", "projectTags"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    showProjectAssignees: state.getIn(["detailview", "showProjectAssignees"]),
    showHistory: state.getIn(["notifications", "showHistory"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"]),
    allowedIntents: state.getIn(["detailview", "allowedIntents"]),
    thumbnail: state.getIn(["detailview", "thumbnail"]),
    projectedBudgets: state.getIn(["detailview", "projectedBudgets"]),
    isSubProjectAdditionalDataShown: state.getIn(["detailview", "isSubProjectAdditionalDataShown"]),
    idForInfo: state.getIn(["detailview", "idForInfo"]),
    isRoot: state.getIn(["navbar", "isRoot"]),
    permissionDialogShown: state.getIn(["detailview", "showSubProjectPermissions"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubProjectContainer));
