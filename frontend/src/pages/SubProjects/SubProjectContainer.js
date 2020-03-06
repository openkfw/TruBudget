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
  showSubProjectPermissions,
  storeSubSearchTerm,
  storeSubSearchBarDisplayed,
  storeFilteredSubProjects,
  storeSubHighlightingRegex,
  storeSubSearchTermArray
} from "./actions";
import ProjectDetails from "./ProjectDetails";
import ProjectHistoryDrawer from "./ProjectHistoryDrawer";
import SubprojectDialogContainer from "./SubprojectDialogContainer";
import SubprojectPermissionsContainer from "./SubprojectPermissionsContainer";
import SubProjects from "./SubProjects";
import { convertToSearchBarString } from "../../helper";
import queryString from "query-string";
import WebWorker from "../../WebWorker.js";
import worker from "../Common/filterProjects.worker.js";
import _isEqual from "lodash/isEqual";

class SubProjectContainer extends Component {
  constructor(props) {
    super(props);
    this.projectId = this.props.location.pathname.split("/")[2];
  }

  componentDidMount() {
    this.props.setSelectedView(this.projectId, "project");
    this.props.fetchAllProjectDetails(this.projectId, true);
    this.props.fetchUser();
    // Get Searchword from URL if available
    if (this.props.location.search) {
      const queryParameter = queryString.parse(this.props.location.search);
      const searchTermString = convertToSearchBarString(queryString.stringify(queryParameter));
      this.props.storeSubSearchTerm(searchTermString);
      this.props.storeSubSearchBarDisplayed(true);
    }
    this.worker = new WebWorker(worker);

    // Listen for postmessage from worker
    this.worker.addEventListener("message", event => {
      const filteredSubProjects = event.data ? event.data.filteredProjects : this.props.subProjects;
      const highlightingRegex = event.data.highlightingRegex;
      const searchTerms = event.data.searchTerms;
      this.props.storeFilteredSubProjects(filteredSubProjects);
      this.props.storeSubHighlightingRegex(highlightingRegex);
      this.props.storeSubSearchTermArray(searchTerms);
    });
  }

  componentDidUpdate(prevProps) {
    const searchTermChanges = this.props.searchTerm !== prevProps.searchTerm;
    const projectsChange = !_isEqual(this.props.subProjects, prevProps.subProjects);

    // Start searching
    if (this.props.searchTerm && (searchTermChanges || projectsChange)) {
      this.worker.postMessage({ projects: this.props.subProjects, searchTerm: this.props.searchTerm });
    }
    // Reset searchbar
    if (!this.props.searchTerm && prevProps.searchTerm) {
      this.props.storeFilteredSubProjects(this.props.subProjects);
      this.props.storeSubHighlightingRegex("");
      this.props.storeSubSearchTermArray([]);
    }
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
          <SubProjects
            {...this.props}
            projectId={projectId}
            canCreateSubProject={canCreateSubproject}
            storeSearchTerm={this.props.storeSubSearchTerm}
            storeSearchBarDisplayed={this.props.storeSubSearchBarDisplayed}
            searchTerm={this.props.searchTerm}
            searchBarDisplayed={this.props.searchBarDisplayed}
            subProjects={this.props.filteredSubProjects}
            highlightingRegex={this.props.highlightingRegex}
          />
          <ProjectHistoryDrawer projectId={projectId} />
          {this.props.permissionDialogShown ? (
            <SubprojectPermissionsContainer projectId={projectId} subProjects={this.props.filteredSubProjects} />
          ) : null}
          <AdditionalInfo
            resources={this.props.filteredSubProjects}
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
    openAnalyticsDialog: () => dispatch(openAnalyticsDialog()),
    storeSubSearchTerm: subSearchTerm => dispatch(storeSubSearchTerm(subSearchTerm)),
    storeSubSearchBarDisplayed: subSearchBarDisplayed => dispatch(storeSubSearchBarDisplayed(subSearchBarDisplayed)),
    storeFilteredSubProjects: filteredSubProjects => dispatch(storeFilteredSubProjects(filteredSubProjects)),
    storeSubHighlightingRegex: highlightingRegex => dispatch(storeSubHighlightingRegex(highlightingRegex)),
    storeSubSearchTermArray: searchTerms => dispatch(storeSubSearchTermArray(searchTerms))
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
    filteredSubProjects: state.getIn(["detailview", "filteredSubProjects"]),
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
    permissionDialogShown: state.getIn(["detailview", "showSubProjectPermissions"]),
    searchTerm: state.getIn(["detailview", "searchTerm"]),
    searchBarDisplayed: state.getIn(["detailview", "searchBarDisplayed"]),
    highlightingRegex: state.getIn(["detailview", "highlightingRegex"]),
    searchTerms: state.getIn(["detailview", "searchTerms"]),
    idsPermissionsUnassigned: state.getIn(["detailview", "idsPermissionsUnassigned"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubProjectContainer));
