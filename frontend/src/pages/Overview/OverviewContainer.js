import React, { Component } from "react";
import { connect } from "react-redux";

import {
  fetchAllProjects,
  showCreationDialog,
  showEditDialog,
  showProjectPermissions,
  showProjectAdditionalData,
  hideProjectAdditionalData
} from "./actions";

import { storeSearchBarDisplayed, storeSearchTerm } from "../Navbar/actions";

import Overview from "./Overview";
import globalStyles from "../../styles";
import { toJS } from "../../helper";

import ProjectPermissionsContainer from "./ProjectPermissionsContainer";
import ProjectDialogContainer from "./ProjectDialogContainer";
import AdditionalInfo from "../Common/AdditionalInfo";

class OverviewContainer extends Component {
  componentDidMount() {
    this.props.fetchAllProjects(true);
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
    closeSearchBar: () => {
      dispatch(storeSearchTerm(""));
      dispatch(storeSearchBarDisplayed(false));
    }
  };
};

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"]),
    idForInfo: state.getIn(["overview", "idForInfo"]),
    isProjectAdditionalDataShown: state.getIn(["overview", "isProjectAdditionalDataShown"]),
    searchTerm: state.getIn(["navbar", "searchTerm"]),
    isRoot: state.getIn(["navbar", "isRoot"]),
    permissionDialogShown: state.getIn(["overview", "permissionDialogShown"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(OverviewContainer));
