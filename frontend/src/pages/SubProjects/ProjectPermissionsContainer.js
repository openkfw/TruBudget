import React, { Component } from "react";
import { connect } from "react-redux";

import PermissionsScreen from "../Common/Permissions/PermissionsScreen";
import { fetchProjectPermissions, hideProjectPermissions, grantPermission, revokePermission } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";
import { projectIntentOrder } from "../../permissions";

class ProjectPermissionsContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchUser(true);
      this.props.fetchProjectPermissions(this.props.id, true);
    }
  }

  isEnabled(allowedIntents) {
    const necessaryIntents = ["project.intent.grantPermission", "project.intent.revokePermission"];
    return necessaryIntents.some(i => allowedIntents.includes(i));
  }

  render() {
    return (
      <PermissionsScreen
        {...this.props}
        intentOrder={projectIntentOrder}
        disabled={!this.isEnabled(this.props.allowedIntents)}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["detailview", "permissions"]),
    allowedIntents: state.getIn(["detailview", "allowedIntents"]),
    user: state.getIn(["login", "user"]),
    show: state.getIn(["detailview", "permissionDialogShown"]),
    id: state.getIn(["detailview", "id"]),
    myself: state.getIn(["login", "id"])
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
