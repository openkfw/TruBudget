import React, { Component } from "react";
import { connect } from "react-redux";
import _isEqual from "lodash/isEqual";

import { toJS } from "../../helper";
import WebWorker from "../../WebWorker.js";
import AdditionalInfo from "../Common/AdditionalInfo";
import worker from "../Common/filterProjects.worker.js";
import LiveUpdates from "../LiveUpdates/LiveUpdates";
import { fetchUser } from "../Login/actions";
import { storeSearchBarDisplayed, storeSearchTerm } from "../Navbar/actions";
import { fetchAllProjectDetails } from "../SubProjects/actions";

import {
  disableAllProjectsLiveUpdates,
  editProject,
  enableAllProjectsLiveUpdates,
  fetchAllProjects,
  hideProjectAdditionalData,
  liveUpdateAllProjects,
  setPage,
  setProjectView,
  setRowsPerPage,
  setSort,
  showCreationDialog,
  showEditDialog,
  showProjectAdditionalData,
  showProjectPermissions,
  storeFilteredProjects,
  storeSearchTermArray
} from "./actions";
import Overview from "./Overview";
import ProjectDialogContainer from "./ProjectDialogContainer";
import ProjectPermissionsContainer from "./ProjectPermissionsContainer";

class OverviewContainer extends Component {
  componentDidMount() {
    this.worker = new WebWorker(worker);

    // Listen for postmessage from worker
    this.worker.addEventListener("message", (event) => {
      const filteredProjects = event.data ? event.data.filteredProjects : this.props.projects;
      const searchTerms = event.data.searchTerms;
      this.props.storeFilteredProjects(filteredProjects);
      this.props.storeSearchTermArray(searchTerms);
    });
    this.props.fetchAllProjects(true);
    this.props.fetchUser();
  }

  componentDidUpdate(prevProps) {
    const searchTermChanges = this.props.searchTermString !== prevProps.searchTermString;
    const projectsChange = !_isEqual(this.props.projects, prevProps.projects);
    if (this.props.searchTermString && (searchTermChanges || projectsChange)) {
      this.worker.postMessage({
        projects: this.props.projects,
        searchTerm: this.props.searchTermString
      });
    }
    if (!this.props.searchTermString && prevProps.searchTermString) {
      this.props.storeFilteredProjects(this.props.projects);
      this.props.storeSearchTermArray([]);
    }
  }

  render() {
    return (
      <div id="overviewpage">
        {this.props.isLiveUpdateAllProjectsEnabled ? <LiveUpdates update={this.update} /> : null}
        <div className="inner-container">
          <Overview {...this.props} />
          <ProjectDialogContainer location={this.props.location} />
          <AdditionalInfo
            resources={this.props.projects}
            idForInfo={this.props.idForInfo}
            isAdditionalDataShown={this.props.isProjectAdditionalDataShown}
            hideAdditionalData={this.props.hideProjectAdditionalData}
            submitAdditionalData={(additionalData) => this.props.editProject(this.props.idForInfo, { additionalData })}
          />
          {this.props.permissionDialogShown ? <ProjectPermissionsContainer {...this.props} /> : null}
        </div>
      </div>
    );
  }

  update = () => {
    this.props.liveUpdate();
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    liveUpdate: () => dispatch(liveUpdateAllProjects()),
    disableLiveUpdates: () => dispatch(disableAllProjectsLiveUpdates()),
    enableLiveUpdates: () => dispatch(enableAllProjectsLiveUpdates()),
    showCreationDialog: () => dispatch(showCreationDialog()),
    showEditDialog: (id, displayName, description, thumbnail, projectedBudgets, tags) =>
      dispatch(showEditDialog(id, displayName, description, thumbnail, projectedBudgets, tags)),
    fetchAllProjects: (showLoading) => dispatch(fetchAllProjects(showLoading)),
    showProjectPermissions: (id, displayName) => dispatch(showProjectPermissions(id, displayName)),
    showProjectAdditionalData: (id) => dispatch(showProjectAdditionalData(id)),
    hideProjectAdditionalData: () => dispatch(hideProjectAdditionalData()),
    storeFilteredProjects: (filteredProjects) => dispatch(storeFilteredProjects(filteredProjects)),
    storeSearchTermArray: (searchTerms) => dispatch(storeSearchTermArray(searchTerms)),
    storeSearchTerm: (searchTerm) => dispatch(storeSearchTerm(searchTerm)),
    showNavSearchBar: () => dispatch(storeSearchBarDisplayed(true)),
    fetchUser: () => dispatch(fetchUser(true)),
    fetchAllProjectDetails: (projectId) => dispatch(fetchAllProjectDetails(projectId, false)),
    setProjectView: (view) => dispatch(setProjectView(view)),
    editProject: (projectId, changes) => dispatch(editProject(projectId, changes, undefined)),
    setPage: (page) => dispatch(setPage(page)),
    setRowsPerPage: (rowsPerPage, page) => dispatch(setRowsPerPage(rowsPerPage, page)),
    setSort: (column, direction) => dispatch(setSort(column, direction))
  };
};

const mapStateToProps = (state) => {
  return {
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    enabledUsers: state.getIn(["login", "enabledUsers"]),
    filteredProjects: state.getIn(["overview", "filteredProjects"]),
    highlightingRegex: state.getIn(["overview", "highlightingRegex"]),
    idForInfo: state.getIn(["overview", "idForInfo"]),
    isDataLoading: state.getIn(["loading", "loadingVisible"]),
    isLiveUpdateAllProjectsEnabled: state.getIn(["overview", "isLiveUpdateAllProjectsEnabled"]),
    isProjectAdditionalDataShown: state.getIn(["overview", "isProjectAdditionalDataShown"]),
    isRoot: state.getIn(["navbar", "isRoot"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    permissionDialogShown: state.getIn(["overview", "permissionDialogShown"]),
    page: state.getIn(["overview", "page"]),
    pagination: state.getIn(["overview", "pagination"]),
    projects: state.getIn(["overview", "projects"]),
    projectView: state.getIn(["overview", "projectView"]),
    roles: state.getIn(["login", "roles"]),
    searchTerm: state.getIn(["navbar", "searchTerm"]), // searchTerm in SearchBar
    searchTermArray: state.getIn(["overview", "searchTerms"]), // only for WebWorker
    searchTermString: state.getIn(["navbar", "searchTerm"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    users: state.getIn(["login", "enabledUsers"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(OverviewContainer));
