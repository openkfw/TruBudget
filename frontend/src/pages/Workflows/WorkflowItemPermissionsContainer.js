import _isEmpty from "lodash/isEmpty";
import React, { Component } from "react";
import { connect } from "react-redux";
import { formatString, toJS } from "../../helper";
import strings from "../../localizeStrings";
import { workflowItemIntentOrder } from "../../permissions";
import PermissionDialog from "../Common/Permissions/PermissionDialog";
import withInitialLoading from "../Loading/withInitialLoading";
import { fetchUser } from "../Login/actions";
import {
  addTemporaryPermission,
  fetchWorkflowItemPermissions,
  grantWorkflowItemPermission,
  hideWorkflowItemPermissions,
  removeTemporaryPermission,
  revokeWorkflowItemPermission
} from "./actions";

class WorkflowItemPermissionsContainer extends Component {
  componentDidMount() {
    this.props.fetchWorkflowItemPermissions(this.props.projectId, this.props.subProjectId, this.props.wId, true);
    this.props.fetchUser();
  }

  shouldComponentUpdate() {
    return !this.props.isConfirmationDialogOpen;
  }

  grant = (permission, granteeId, granteeName) => {
    this.props.grant(
      this.props.projectId,
      this.props.projectDisplayName,
      this.props.subprojectId,
      this.props.subprojectDisplayName,
      this.props.wId,
      this.props.workflowitemDisplayName,
      permission,
      granteeId,
      granteeName
    );
  };

  revoke = (permission, revokeeId, revokeeName) => {
    this.props.revoke(
      this.props.projectId,
      this.props.projectDisplayName,
      this.props.subprojectId,
      this.props.subprojectDisplayName,
      this.props.wId,
      this.props.workflowitemDisplayName,
      permission,
      revokeeId,
      revokeeName
    );
  };

  hasOnlyViewPermissions(workflowitems, selection) {
    const item = workflowitems.filter(i => i.data.id === selection);
    const allowedIntents = item.length > 0 ? item[0].allowedIntents : [];
    const necessaryIntents = ["workflowitem.intent.grantPermission", "workflowitem.intent.revokePermission"];
    return necessaryIntents.every(i => !allowedIntents.includes(i));
  }

  /*
   * Submit is disabled in the following cases
   *  - Temporary permissions are added: Submit disabled if grant permissions are missing
   *  - Temporary permissions are removed: Submit disabled if revoke permissions are missing
   */
  isSubmitDisabled(workflowitems, selection, workflowitemPermissions, temporaryPermissions) {
    if (_isEmpty(temporaryPermissions)) return true;

    const item = workflowitems.filter(i => i.data.id === selection);
    const allowedIntents = item.length > 0 ? item[0].allowedIntents : [];
    const hasGrantPermissions = allowedIntents.includes("workflowitem.intent.grantPermission");
    const hasRevokePermissions = allowedIntents.includes("workflowitem.intent.revokePermission");
    const temporaryPermissionsAdded = Object.keys(workflowitemPermissions).some(intent =>
      temporaryPermissions[intent]
        ? temporaryPermissions[intent].some(id => !workflowitemPermissions[intent].includes(id))
        : false
    );
    const temporaryPermissionsRemoved = Object.keys(workflowitemPermissions).some(intent =>
      workflowitemPermissions[intent].some(id => !temporaryPermissions[intent].includes(id))
    );

    if ((!hasGrantPermissions && temporaryPermissionsAdded) || (!hasRevokePermissions && temporaryPermissionsRemoved)) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    return (
      <PermissionDialog
        {...this.props}
        title={formatString(strings.permissions.dialog_title, this.props.workflowitemDisplayName)}
        open={this.props.permissionDialogShown}
        id={this.props.wId}
        userList={this.props.userList}
        grant={this.grant}
        revoke={this.revoke}
        intentOrder={workflowItemIntentOrder}
        disabledUserSelection={this.hasOnlyViewPermissions(this.props.workflowItems, this.props.wId)}
        disabledSubmit={this.isSubmitDisabled(
          this.props.workflowItems,
          this.props.wId,
          this.props.permissions,
          this.props.temporaryPermissions
        )}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["workflow", "permissions", "workflowitem"]),
    temporaryPermissions: state.getIn(["workflow", "temporaryPermissions"]),
    projectId: state.getIn(["workflow", "parentProject", "id"]),
    projectDisplayName: state.getIn(["workflow", "parentProject", "displayName"]),
    subprojectId: state.getIn(["workflow", "id"]),
    subprojectDisplayName: state.getIn(["workflow", "displayName"]),
    wId: state.getIn(["workflow", "workflowItemReference"]),
    workflowitemDisplayName: state.getIn(["workflow", "workflowitemDisplayName"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    permissionDialogShown: state.getIn(["workflow", "showWorkflowPermissions"]),
    userList: state.getIn(["login", "user"]),
    isConfirmationDialogOpen: state.getIn(["confirmation", "open"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hidePermissionDialog: () => dispatch(hideWorkflowItemPermissions()),
    grant: (pId, pName, sId, sName, wId, wName, permission, granteeId, granteeName) =>
      dispatch(
        grantWorkflowItemPermission(pId, pName, sId, sName, wId, wName, permission, granteeId, granteeName, true)
      ),
    revoke: (pId, pName, sId, sName, wId, wName, permission, revokeeId, revokeeName) =>
      dispatch(
        revokeWorkflowItemPermission(pId, pName, sId, sName, wId, wName, permission, revokeeId, revokeeName, true)
      ),
    fetchWorkflowItemPermissions: (pId, spId, wId, showLoading) =>
      dispatch(fetchWorkflowItemPermissions(pId, spId, wId, showLoading)),
    fetchUser: () => dispatch(fetchUser(true)),
    addTemporaryPermission: (permission, userId) => dispatch(addTemporaryPermission(permission, userId)),
    removeTemporaryPermission: (permission, userId) => dispatch(removeTemporaryPermission(permission, userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowItemPermissionsContainer)));
