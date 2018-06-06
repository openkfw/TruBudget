import React, { Component } from "react";
import { connect } from "react-redux";

import PermissionsScreen from "../Common/Permissions/PermissionsScreen";
import {
  fetchWorkflowItemPermissions,
  grantWorkflowItemPermission,
  hideWorkflowItemPermissions,
  revokeWorkflowItemPermission
} from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";
import { workflowItemIntentOrder } from "../../permissions";

class WorkflowItemPermissionsContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchWorkflowItemPermissions(nextProps.projectId, nextProps.wId, true);
      this.props.fetchUser();
    }
  }

  grant = (_, permission, user) => {
    this.props.grant(this.props.projectId, this.props.subProjectId, this.props.wId, permission, user);
  };
  revoke = (_, permission, user) => {
    this.props.revoke(this.props.projectId, this.props.subProjectId, this.props.wId, permission, user);
  };

  render() {
    return (
      <PermissionsScreen
        {...this.props}
        grant={this.grant}
        revoke={this.revoke}
        intentOrder={workflowItemIntentOrder}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["workflow", "permissions"]),
    user: state.getIn(["login", "user"]),
    show: state.getIn(["workflow", "showWorkflowPermissions"]),
    wId: state.getIn(["workflow", "workflowItemReference"]),
    myself: state.getIn(["login", "id"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideWorkflowItemPermissions()),
    grant: (pId, sId, wId, permission, user) =>
      dispatch(grantWorkflowItemPermission(pId, sId, wId, permission, user, true)),
    revoke: (pId, sId, wId, permission, user) =>
      dispatch(revokeWorkflowItemPermission(pId, sId, wId, permission, user, true)),
    fetchWorkflowItemPermissions: (pId, wId, showLoading) =>
      dispatch(fetchWorkflowItemPermissions(pId, wId, showLoading)),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowItemPermissionsContainer)));
