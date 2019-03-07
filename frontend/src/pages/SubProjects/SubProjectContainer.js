import React, { Component } from "react";
import { connect } from "react-redux";

import {
  fetchAllProjectDetails,
  showSubprojectDialog,
  showProjectAssignees,
  fetchProjectHistory,
  showEditDialog,
  closeProject,
  showSubProjectPermissions,
  liveUpdateProject,
  showSubProjectInfo,
  hideSubProjectInfo
} from "./actions";

import SubProjects from "./SubProjects";
import { showHistory, hideHistory } from "../Notifications/actions";
import { setSelectedView } from "../Navbar/actions";
import ProjectDetails from "./ProjectDetails";
import globalStyles from "../../styles";
import { toJS } from "../../helper";
import strings from "../../localizeStrings";
import { fetchUser } from "../Login/actions";
import ProjectHistoryContainer from "./ProjectHistoryContainer";
import { canCreateSubProject, canAssignProject, canCloseProject } from "../../permissions";
import SubprojectPermissionsContainer from "./SubprojectPermissionsContainer";
import SubprojectDialogContainer from "./SubprojectDialogContainer";
import LiveUpdates from "../LiveUpdates/LiveUpdates";
import SubProjectInfo from "./SubProjectInfo";

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
    const canCreateSubproject = canCreateSubProject(this.props.allowedIntents);
    const canAssign = canAssignProject(this.props.allowedIntents);
    const canClose = canCloseProject(this.props.allowedIntents);
    return (
      <div>
        <LiveUpdates update={this.update} />
        <div style={globalStyles.innerContainer}>
          <ProjectDetails
            {...this.props}
            canAssignProject={canAssign}
            closeProject={this.closeProject}
            canClose={canClose}
          />
          <SubProjects {...this.props} canCreateSubProject={canCreateSubproject} />
          <ProjectHistoryContainer projectId={this.projectId} offset={this.props.offset} limit={this.props.limit} />
          <SubprojectPermissionsContainer
            projectId={this.projectId}
            subProjects={this.props.subProjects}
            title={strings.subproject.subproject_permissions_title}
          />
          {/* // TODO: put SubProjectInfo in separate container */}
          <SubProjectInfo {...this.props} />
          <SubprojectDialogContainer location={this.props.location} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllProjectDetails: (projectId, showLoading) => dispatch(fetchAllProjectDetails(projectId, showLoading)),
    liveUpdate: projectId => dispatch(liveUpdateProject(projectId)),
    showSubprojectDialog: () => dispatch(showSubprojectDialog()),

    openHistory: (projectId, offset, limit) => {
      dispatch(fetchProjectHistory(projectId, offset, limit, true));
      dispatch(showHistory());
    },
    hideHistory: () => dispatch(hideHistory()),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    showProjectAssignees: () => dispatch(showProjectAssignees()),
    showEditDialog: (id, displayName, description, amount, currency) =>
      dispatch(showEditDialog(id, displayName, description, amount, currency)),
    fetchUser: () => dispatch(fetchUser(true)),
    closeProject: pId => dispatch(closeProject(pId, true)),
    showSubProjectPermissions: id => dispatch(showSubProjectPermissions(id)),
    showSubProjectInfo: id => dispatch(showSubProjectInfo(id)),
    hideSubProjectInfo: () => dispatch(hideSubProjectInfo())
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
    projectAssignee: state.getIn(["detailview", "projectAssignee"]),
    projectTS: state.getIn(["detailview", "projectTS"]),
    projectProjectedBudgets: state.getIn(["detailview", "projectProjectedBudgets"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    showProjectAssignees: state.getIn(["detailview", "showProjectAssignees"]),
    showHistory: state.getIn(["notifications", "showHistory"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"]),
    user: state.getIn(["login", "user"]),
    allowedIntents: state.getIn(["detailview", "allowedIntents"]),
    thumbnail: state.getIn(["detailview", "thumbnail"]),
    offset: state.getIn(["detailview", "offset"]),
    limit: state.getIn(["detailview", "limit"]),
    projectedBudgets: state.getIn(["detailview", "projectedBudgets"]),
    isSubProjectInfoShown: state.getIn(["detailview", "isSubProjectInfoShown"]),
    idForInfo: state.getIn(["detailview", "idForInfo"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubProjectContainer));
