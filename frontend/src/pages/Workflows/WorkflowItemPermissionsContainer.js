import React, { Component } from "react";
import { connect } from "react-redux";

import PermissionDialog from "../Common/Permissions/PermissionDialog";
import {
  fetchWorkflowItemPermissions,
  grantWorkflowItemPermission,
  hideWorkflowItemPermissions,
  revokeWorkflowItemPermission,
  addTemporaryPermission,
  removeTemporaryPermission
} from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";
import { workflowItemIntentOrder } from "../../permissions";

class WorkflowItemPermissionsContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.permissionDialogShown && nextProps.permissionDialogShown) {
      this.props.fetchWorkflowItemPermissions(nextProps.projectId, nextProps.subProjectId, nextProps.wId, true);
      this.props.fetchUser();
    }
  }

  grant = (_, permission, user) => {
    this.props.grant(this.props.projectId, this.props.subProjectId, this.props.wId, permission, user);
  };
  revoke = (_, permission, user) => {
    this.props.revoke(this.props.projectId, this.props.subProjectId, this.props.wId, permission, user);
  };

  isEnabled = (wf, selection) => {
    const item = wf.filter(i => i.data.id === selection);
    const allowedIntents = item.length > 0 ? item[0].allowedIntents : [];
    const necessaryIntents = ["workflowitem.intent.grantPermission", "workflowitem.intent.revokePermission"];
    return necessaryIntents.some(i => allowedIntents.includes(i));
  };

  render() {
    return (
      <PermissionDialog
        {...this.props}
        grant={this.grant}
        revoke={this.revoke}
        intentOrder={workflowItemIntentOrder}
        disabled={!this.isEnabled(this.props.workflowItems, this.props.wId)}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["workflow", "permissions", "workflowitem"]),
    temporaryPermissions: state.getIn(["workflow", "temporaryPermissions"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    user: state.getIn(["login", "user"]),
    permissionDialogShown: state.getIn(["workflow", "showWorkflowPermissions"]),
    wId: state.getIn(["workflow", "workflowItemReference"]),
    myself: state.getIn(["login", "id"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hidePermissionDialog: () => dispatch(hideWorkflowItemPermissions()),
    grant: (pId, sId, wId, permission, user) =>
      dispatch(grantWorkflowItemPermission(pId, sId, wId, permission, user, true)),
    revoke: (pId, sId, wId, permission, user) =>
      dispatch(revokeWorkflowItemPermission(pId, sId, wId, permission, user, true)),
    fetchWorkflowItemPermissions: (pId, spId, wId, showLoading) =>
      dispatch(fetchWorkflowItemPermissions(pId, spId, wId, showLoading)),
    fetchUser: () => dispatch(fetchUser(true)),
    addTemporaryPermission: (permission, userId) => dispatch(addTemporaryPermission(permission, userId)),
    removeTemporaryPermission: (permission, userId) => dispatch(removeTemporaryPermission(permission, userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowItemPermissionsContainer)));
