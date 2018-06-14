import React, { Component } from "react";
import { connect } from "react-redux";

import PermissionsScreen from "../Common/Permissions/PermissionsScreen";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

import _isEmpty from "lodash/isEmpty";
import { projectIntentOrder } from "../../permissions";
import strings from "../../localizeStrings";
import { hideProjectPermissions, fetchProjectPermissions, grantPermission, revokePermission } from "./actions";

class ProjectPermissionsContainer extends Component {
  componentWillMount() {
    this.props.fetchUser(true);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      const projectId = nextProps.id;
      this.props.fetchProjectPermissions(projectId, true);
    }
  }

  isEnabled(allowedIntents) {
    const necessaryIntents = ["project.intent.grantPermission", "project.intent.revokePermission"];
    return necessaryIntents.some(i => allowedIntents.includes(i));
  }

  getAllowedIntents = () => {
    const { projects, id } = this.props;
    if (projects && !_isEmpty(id)) {
      const { allowedIntents } = projects.find(project => project.data.id === id);
      return allowedIntents;
    }
    return [];
  };

  render() {
    const allowedIntents = this.getAllowedIntents();

    return (
      <PermissionsScreen
        {...this.props}
        title={strings.project.project_permissions_title}
        intentOrder={projectIntentOrder}
        disabled={!this.isEnabled(allowedIntents)}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["overview", "permissions"]),
    user: state.getIn(["login", "user"]),
    show: state.getIn(["overview", "permissionDialogShown"]),
    myself: state.getIn(["login", "id"]),
    id: state.getIn(["overview", "idForPermissions"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideProjectPermissions()),
    grant: (projectId, permission, user) => dispatch(grantPermission(projectId, permission, user, true)),
    revoke: (projectId, permission, user) => dispatch(revokePermission(projectId, permission, user, true)),
    fetchProjectPermissions: (projectId, showLoading) => dispatch(fetchProjectPermissions(projectId, showLoading)),
    fetchUser: showLoading => dispatch(fetchUser(showLoading))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(ProjectPermissionsContainer)));
