import _isEmpty from "lodash/isEmpty";
import React from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import { fetchProjectPermissions, grantProjectPermission, revokeProjectPermission } from "../Overview/actions";
import {
  assignProject,
  closeProject,
  fetchSubProjectPermissions,
  grantSubProjectPermission,
  revokeSubProjectPermission
} from "../SubProjects/actions";
import { fetchGroups, disableUser, enableUser, fetchUserAssignments, cleanUserAssignments } from "../Users/actions";
import {
  assignSubproject,
  assignWorkflowItem,
  closeSubproject,
  closeWorkflowItem,
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
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.props.cancelConfirmation();
    }

    const isConfirmationDialogTriggered =
      this.props.confirmationDialogOpen !== prevProps.confirmationDialogOpen &&
      this.props.confirmationDialogOpen === true;

    if (isConfirmationDialogTriggered) {
      this.props.fetchGroups();
      this.fetchPermissions(this.props.project, this.props.subproject, this.props.workflowitem);
    }

    if (prevProps.originalActions.length < this.props.originalActions.length) {
      this.props.additionalActionUpdateRequired(true);
    }

    if (this.props.originalActionsIncreased && !this.isFetchingPermissions()) {
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

  isFetchingPermissions() {
    return (
      this.props.isFetchingProjectPermissions ||
      this.props.isFetchingSubprojectPermissions ||
      this.props.isFetchingWorkflowitemPermissions
    );
  }

  fetchPermissions(project, subproject, workflowitem) {
    if (project.listPermissionsNeeded) this.props.fetchProjectPermissions(project.id);
    if (subproject.listPermissionsNeeded) this.props.fetchSubprojectPermissions(project.id, subproject.id);
    if (workflowitem.listPermissionsNeeded)
      this.props.fetchWorkflowitemPermissions(project.id, subproject.id, workflowitem.id);
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
      this.props.revokeWorkflowitemPermission,
      this.props.closeProject,
      this.props.closeSubproject,
      this.props.closeWorkflowItem,
      this.props.disableUser,
      this.props.enableUser
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
      isListPermissionsRequiredFromApi,
      failedAction,
      requestedPermissions,
      userList,
      fetchUserAssignments,
      cleanUserAssignments,
      userAssignments,
      editId
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
          executedAdditionalActions={executedAdditionalActions}
          additionalActions={additionalActions}
          additionalActionsExecuted={additionalActionsExecuted}
          executingAdditionalActions={executingAdditionalActions}
          project={project}
          subproject={subproject}
          workflowitem={workflowitem}
          isListPermissionsRequiredFromApi={isListPermissionsRequiredFromApi}
          failedAction={failedAction}
          requestedPermissions={requestedPermissions}
          userList={userList}
          fetchUserAssignments={fetchUserAssignments}
          cleanUserAssignments={cleanUserAssignments}
          userAssignments={userAssignments}
          editId={editId}
        />
      );
    } else {
      return null;
    }
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchGroups: () => dispatch(fetchGroups(false)),
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
      dispatch(grantProjectPermission(pId, pName, permission, granteeId, granteeName, true)),
    revokeProjectPermission: (pId, pName, permission, revokeeId, revokeeName) =>
      dispatch(revokeProjectPermission(pId, pName, permission, revokeeId, revokeeName, true)),
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
    additionalActionUpdateRequired: required => dispatch(additionalActionUpdateRequired(required)),
    closeProject: pId => dispatch(closeProject(pId, true)),
    closeSubproject: (pId, sId) => dispatch(closeSubproject(pId, sId, true)),
    closeWorkflowItem: (pId, sId, wId) => dispatch(closeWorkflowItem(pId, sId, wId, true)),
    disableUser: userId => dispatch(disableUser(userId)),
    enableUser: userId => dispatch(enableUser(userId)),
    fetchUserAssignments: userId => dispatch(fetchUserAssignments(userId)),
    cleanUserAssignments: () => dispatch(cleanUserAssignments())
  };
};

const mapStateToProps = state => {
  return {
    confirmationDialogOpen: state.getIn(["confirmation", "open"]),
    originalActions: state.getIn(["confirmation", "originalActions"]),
    confirmDisabled: state.getIn(["confirmation", "disabled"]),
    permissions: state.getIn(["confirmation", "permissions"]),
    confirmingUser: state.getIn(["login", "id"]),
    userList: state.getIn(["login", "enabledUsers"]),
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
    isListPermissionsRequiredFromApi: state.getIn(["confirmation", "isListPermissionsRequiredFromApi"]),
    failedAction: state.getIn(["confirmation", "failedAction"]),
    requestedPermissions: state.getIn(["confirmation", "requestedPermissions"]),
    groups: state.getIn(["users", "groups"]),
    userAssignments: state.getIn(["users", "userAssignments"]),
    editId: state.getIn(["users", "editId"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(ConfirmationContainer));
