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

import Overview from "./Overview";
import globalStyles from "../../styles";
import { toJS } from "../../helper";

import ProjectPermissionsContainer from "./ProjectPermissionsContainer";
import ProjectDialogContainer from "./ProjectDialogContainer";
import AdditionalInfo from "../Common/AdditionalInfo";

class OverviewContainer extends Component {
  componentWillMount() {
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
          <ProjectPermissionsContainer {...this.props} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showCreationDialog: () => dispatch(showCreationDialog()),
    showEditDialog: (id, displayName, description, thumbnail, projectedBudgets) =>
      dispatch(showEditDialog(id, displayName, description, thumbnail, projectedBudgets)),

    fetchAllProjects: showLoading => dispatch(fetchAllProjects(showLoading)),
    showProjectPermissions: id => dispatch(showProjectPermissions(id)),
    showProjectAdditionalData: id => dispatch(showProjectAdditionalData(id)),
    hideProjectAdditionalData: () => dispatch(hideProjectAdditionalData())
  };
};

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"]),
    idForInfo: state.getIn(["overview", "idForInfo"]),
    isProjectAdditionalDataShown: state.getIn(["overview", "isProjectAdditionalDataShown"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(OverviewContainer));
