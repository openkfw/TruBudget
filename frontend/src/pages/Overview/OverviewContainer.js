import React, { Component } from "react";
import { connect } from "react-redux";

import { fetchAllProjects, showCreationDialog, showEditDialog, showProjectPermissions } from "./actions";

import Overview from "./Overview";
import globalStyles from "../../styles";
import { toJS } from "../../helper";

import ProjectPermissionsContainer from "./ProjectPermissionsContainer";
import ProjectDialogContainer from "./ProjectDialogContainer";

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
          <ProjectPermissionsContainer {...this.props} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showCreationDialog: () => dispatch(showCreationDialog()),
    showEditDialog: (id, displayName, amount, currency, description, thumbnail) =>
      dispatch(showEditDialog(id, displayName, amount, currency, description, thumbnail)),

    fetchAllProjects: showLoading => dispatch(fetchAllProjects(showLoading)),
    showProjectPermissions: id => dispatch(showProjectPermissions(id))
  };
};

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(OverviewContainer));
