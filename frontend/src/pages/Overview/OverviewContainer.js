import _isEqual from "lodash/isEqual";
import React, { Component } from "react";
import { connect } from "react-redux";
import worker from "../Common/filterProjects.worker.js";
import { toJS } from "../../helper";
import globalStyles from "../../styles";
import WebWorker from "../../WebWorker.js";
import AdditionalInfo from "../Common/AdditionalInfo";
import { storeSearchBarDisplayed, storeSearchTerm } from "../Navbar/actions";
import {
  fetchAllProjects,
  hideProjectAdditionalData,
  showCreationDialog,
  showEditDialog,
  showProjectAdditionalData,
  showProjectPermissions,
  storeFilteredProjects,
  storeHighlightingRegex,
  storeSearchTermArray
} from "./actions";
import Overview from "./Overview";
import ProjectDialogContainer from "./ProjectDialogContainer";
import ProjectPermissionsContainer from "./ProjectPermissionsContainer";

class OverviewContainer extends Component {
  componentDidMount() {
    this.worker = new WebWorker(worker);

    // Listen for postmessage from worker
    this.worker.addEventListener("message", event => {
      const filteredProjects = event.data ? event.data.filteredProjects : this.props.projects;
      const highlightingRegex = event.data.highlightingRegex;
      const searchTerms = event.data.searchTerms;
      this.props.storeFilteredProjects(filteredProjects);
      this.props.storeHighlightingRegex(highlightingRegex);
      this.props.storeSearchTermArray(searchTerms);
    });
    this.props.fetchAllProjects(true);
  }

  componentDidUpdate(prevProps) {
    const searchTermChanges = this.props.searchTermString !== prevProps.searchTermString;
    const projectsChange = !_isEqual(this.props.projects, prevProps.projects);
    if (this.props.searchTermString && (searchTermChanges || projectsChange)) {
      this.worker.postMessage({ projects: this.props.projects, searchTerm: this.props.searchTermString });
    }
    if (!this.props.searchTermString && prevProps.searchTermString) {
      this.props.storeFilteredProjects(this.props.projects);
      this.props.storeHighlightingRegex("");
      this.props.storeSearchTermArray([]);
    }
  }

  render() {
    return (
      <div id="overviewpage">
        <div style={globalStyles.innerContainer}>
          <Overview {...this.props} />
          <ProjectDialogContainer location={this.props.location} />
          <AdditionalInfo
            resources={this.props.projects}
            isAdditionalDataShown={this.props.isProjectAdditionalDataShown}
            hideAdditionalData={this.props.hideProjectAdditionalData}
            {...this.props}
          />
          {this.props.permissionDialogShown ? <ProjectPermissionsContainer {...this.props} /> : null}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showCreationDialog: () => dispatch(showCreationDialog()),
    showEditDialog: (id, displayName, description, thumbnail, projectedBudgets, tags) =>
      dispatch(showEditDialog(id, displayName, description, thumbnail, projectedBudgets, tags)),
    fetchAllProjects: showLoading => dispatch(fetchAllProjects(showLoading)),
    showProjectPermissions: (id, displayName) => dispatch(showProjectPermissions(id, displayName)),
    showProjectAdditionalData: id => dispatch(showProjectAdditionalData(id)),
    hideProjectAdditionalData: () => dispatch(hideProjectAdditionalData()),
    storeFilteredProjects: filteredProjects => dispatch(storeFilteredProjects(filteredProjects)),
    storeHighlightingRegex: highlightingRegex => dispatch(storeHighlightingRegex(highlightingRegex)),
    storeSearchTermArray: searchTerms => dispatch(storeSearchTermArray(searchTerms)),
    storeSearchTerm: searchTerm => dispatch(storeSearchTerm(searchTerm)),
    showSearchBar: () => dispatch(storeSearchBarDisplayed(true))
  };
};

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    filteredProjects: state.getIn(["overview", "filteredProjects"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"]),
    idForInfo: state.getIn(["overview", "idForInfo"]),
    isProjectAdditionalDataShown: state.getIn(["overview", "isProjectAdditionalDataShown"]),
    searchTermString: state.getIn(["navbar", "searchTerm"]),
    isRoot: state.getIn(["navbar", "isRoot"]),
    permissionDialogShown: state.getIn(["overview", "permissionDialogShown"]),
    highlightingRegex: state.getIn(["overview", "highlightingRegex"]),
    searchTermArray: state.getIn(["overview", "searchTerms"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(OverviewContainer));
