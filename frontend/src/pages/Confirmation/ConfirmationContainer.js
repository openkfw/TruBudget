import _isEmpty from "lodash/isEmpty";
import React from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import { fetchGroups } from "../Users/actions";
import { fetchProjectPermissions, grantPermission, revokePermission } from "../Overview/actions";
import {
  assignProject,
  fetchSubProjectPermissions,
  grantSubProjectPermission,
  revokeSubProjectPermission
} from "../SubProjects/actions";
import {
  assignSubproject,
  assignWorkflowItem,
  fetchWorkflowItemPermissions,
  grantWorkflowItemPermission,
  revokeWorkflowItemPermission
} from "../Workflows/actions";
import {
  additionalActionUpdateRequired,
  cancelConfirmation,
  confirmConfirmation,
  executeAdditionalActions,
  storeAdditionalActions,
  storeRequestedPermissions
} from "./actions";
import ConfirmationDialog from "./ConfirmationDialog";
import { applyOriginalActions, createAdditionalActions } from "./createAdditionalActions";
import { executeOriginalActions } from "./executeOriginalActions";

class ConfirmationContainer extends React.Component {
  componentDidUpdate(prevProps) {
    // Fetch Permissions if grant/revoke permission confirmation required
    if (
      this.props.confirmationDialogOpen !== prevProps.confirmationDialogOpen &&
      this.props.confirmationDialogOpen === true &&
      this.props.originalActions.some(action => !_isEmpty(action.payload))
    ) {
      this.props.fetchGroups();
      this.fetchPermissions(this.props.project, this.props.subproject, this.props.workflowitem);
    }

    if (prevProps.originalActions.length < this.props.originalActions.length) {
      this.props.additionalActionUpdateRequired(true);
    }

    if (this.props.originalActionsIncreased && !this.permissionsEmpty() && !this.isFetchingPermissions()) {
      const additionalActions = createAdditionalActions(
        this.props.originalActions,
        this.props.permissions,
        this.props.project,
        this.props.subproject
      );

      this.props.storeAdditionalActions(additionalActions);
      this.props.additionalActionUpdateRequired(false);
    }
    // Store requested permissions for permission dialog state in case of cancel
    if (
      _isEmpty(this.props.requestedPermissions) &&
      this.includesPermissionIntent(this.props.originalActions) &&
      !_isEmpty(this.props.permissions[this.props.originalActions[0].intent.split(".")[0]])
    ) {
      const permissions = applyOriginalActions(this.props.permissions, this.props.originalActions);
      const resource = Object.keys(permissions)[0].split(".")[0];
      this.props.storeRequestedPermissions({
        [resource]: permissions
      });
    }
  }

  permissionsEmpty() {
    return (
      _isEmpty(this.props.permissions.project) &&
      _isEmpty(this.props.permissions.subproject) &&
      _isEmpty(this.props.permissions.workflowitem)
    );
  }

  isFetchingPermissions() {
    return (
      this.props.isFetchingProjectPermissions ||
      this.props.isFetchingSubprojectPermissions ||
      this.props.isFetchingWorkflowitemPermissions
    );
  }

  fetchPermissions(project, subproject, workflowitem) {
    this.props.fetchProjectPermissions(project.id);
    if (!_isEmpty(subproject)) this.props.fetchSubprojectPermissions(project.id, subproject.id);
    if (!_isEmpty(workflowitem)) this.props.fetchWorkflowitemPermissions(project.id, subproject.id, workflowitem.id);
  }

  onConfirm(confirm) {
    confirm();
    executeOriginalActions(
      this.props.originalActions,
      this.props.assignProject,
      this.props.assignSubproject,
      this.props.assignWorkflowitem,
      this.props.grantProjectPermission,
      this.props.revokeProjectPermission,
      this.props.grantSubprojectPermission,
      this.props.revokeSubprojectPermission,
      this.props.grantWorkflowitemPermission,
      this.props.revokeWorkflowitemPermission
    );
  }

  includesPermissionIntent(originalActions) {
    return originalActions.some(originalAction => {
      const intent = originalAction.intent.split(".")[originalAction.intent.split(".").length - 1];
      return intent === "grantPermission" || intent === "revokePermission";
    });
  }

  render() {
    const {
      cancelConfirmation,
      confirmConfirmation,
      confirmationDialogOpen,
      confirmed,
      originalActions,
      executeConfirmedActions,
      permissions,
      confirmingUser,
      groups,
      executedAdditionalActions,
      additionalActions,
      additionalActionsExecuted,
      executingAdditionalActions,
      project,
      subproject,
      workflowitem,
      listPermissionsRequired,
      failedAction,
      requestedPermissions,
      userList
    } = this.props;

    if (confirmationDialogOpen && !confirmed) {
      return (
        <ConfirmationDialog
          open={confirmationDialogOpen}
          originalActions={originalActions}
          onConfirm={() => this.onConfirm(confirmConfirmation)}
          onCancel={cancelConfirmation}
          executeConfirmedActions={executeConfirmedActions}
          permissions={permissions}
          confirmingUser={confirmingUser}
          groups={groups}
          isFetchingPermissions={this.isFetchingPermissions()}
          permissionsEmpty={this.permissionsEmpty()}
          executedAdditionalActions={executedAdditionalActions}
          additionalActions={additionalActions}
          additionalActionsExecuted={additionalActionsExecuted}
          executingAdditionalActions={executingAdditionalActions}
          project={project}
          subproject={subproject}
          workflowitem={workflowitem}
          listPermissionsRequired={listPermissionsRequired}
          failedAction={failedAction}
          requestedPermissions={requestedPermissions}
          userList={userList}
        />
      );
    } else {
      return null;
    }
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchGroups: () => dispatch(fetchGroups(true)),
    fetchProjectPermissions: pId => dispatch(fetchProjectPermissions(pId, false)),
    fetchSubprojectPermissions: (pId, sId) => dispatch(fetchSubProjectPermissions(pId, sId, false)),
    fetchWorkflowitemPermissions: (pId, spId, wId) => dispatch(fetchWorkflowItemPermissions(pId, spId, wId, false)),
    confirmConfirmation: () => dispatch(confirmConfirmation()),
    cancelConfirmation: permissions => dispatch(cancelConfirmation(permissions)),
    executeConfirmedActions: (actions, pId, subId) => dispatch(executeAdditionalActions(actions, pId, subId, false)),
    storeAdditionalActions: actions => dispatch(storeAdditionalActions(actions)),
    storeRequestedPermissions: permissions => dispatch(storeRequestedPermissions(permissions)),
    assignProject: (projectId, projectDisplayName, assigneeId, assigneeDisplayName) =>
      dispatch(assignProject(projectId, projectDisplayName, assigneeId, assigneeDisplayName)),
    assignSubproject: (pId, pDisplayName, subpId, subpName, assigneeId, assigneeName) =>
      dispatch(assignSubproject(pId, pDisplayName, subpId, subpName, assigneeId, assigneeName)),
    assignWorkflowitem: (pId, pDisplayName, subpId, subpName, wId, wName, assigneeId, assigneeName) =>
      dispatch(assignWorkflowItem(pId, pDisplayName, subpId, subpName, wId, wName, assigneeId, assigneeName)),
    grantProjectPermission: (pId, pName, permission, granteeId, granteeName) =>
      dispatch(grantPermission(pId, pName, permission, granteeId, granteeName, true)),
    revokeProjectPermission: (pId, pName, permission, revokeeId, revokeeName) =>
      dispatch(revokePermission(pId, pName, permission, revokeeId, revokeeName, true)),
    grantSubprojectPermission: (pId, pName, sId, sName, permission, granteeId, granteeName) =>
      dispatch(grantSubProjectPermission(pId, pName, sId, sName, permission, granteeId, granteeName, true)),
    revokeSubprojectPermission: (pId, pName, sId, sName, permission, revokeeId, revokeeName) =>
      dispatch(revokeSubProjectPermission(pId, pName, sId, sName, permission, revokeeId, revokeeName, true)),
    grantWorkflowitemPermission: (pId, pName, sId, sName, wId, wName, permission, granteeId, granteeName) =>
      dispatch(
        grantWorkflowItemPermission(pId, pName, sId, sName, wId, wName, permission, granteeId, granteeName, true)
      ),
    revokeWorkflowitemPermission: (pId, pName, sId, sName, wId, wName, permission, revokeeId, revokeeName) =>
      dispatch(
        revokeWorkflowItemPermission(pId, pName, sId, sName, wId, wName, permission, revokeeId, revokeeName, true)
      ),
    additionalActionUpdateRequired: required => dispatch(additionalActionUpdateRequired(required))
  };
};

const mapStateToProps = state => {
  return {
    confirmationDialogOpen: state.getIn(["confirmation", "open"]),
    originalActions: state.getIn(["confirmation", "originalActions"]),
    confirmDisabled: state.getIn(["confirmation", "disabled"]),
    permissions: state.getIn(["confirmation", "permissions"]),
    confirmingUser: state.getIn(["login", "id"]),
    userList: state.getIn(["login", "user"]),
    isFetchingProjectPermissions: state.getIn(["confirmation", "isFetchingProjectPermissions"]),
    isFetchingSubprojectPermissions: state.getIn(["confirmation", "isFetchingSubprojectPermissions"]),
    isFetchingWorkflowitemPermissions: state.getIn(["confirmation", "isFetchingWorkflowitemPermissions"]),
    executedAdditionalActions: state.getIn(["confirmation", "executedAdditionalActions"]),
    additionalActions: state.getIn(["confirmation", "additionalActions"]),
    additionalActionsExecuted: state.getIn(["confirmation", "additionalActionsExecuted"]),
    executingAdditionalActions: state.getIn(["confirmation", "executingAdditionalActions"]),
    confirmed: state.getIn(["confirmation", "confirmed"]),
    project: state.getIn(["confirmation", "project"]),
    subproject: state.getIn(["confirmation", "subproject"]),
    workflowitem: state.getIn(["confirmation", "workflowitem"]),
    originalActionsIncreased: state.getIn(["confirmation", "originalActionsIncreased"]),
    listPermissionsRequired: state.getIn(["confirmation", "listPermissionsRequired"]),
    failedAction: state.getIn(["confirmation", "failedAction"]),
    requestedPermissions: state.getIn(["confirmation", "requestedPermissions"]),
    groups: state.getIn(["users", "groups"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(ConfirmationContainer));
