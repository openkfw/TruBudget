import React from "react";
import { connect } from "react-redux";
import _isEmpty from "lodash/isEmpty";

import { toJS } from "../../helper";
import { withRouter } from "../../wrappers/withRouter";
import { fetchProjectPermissions, grantProjectPermission, revokeProjectPermission } from "../Overview/actions";
import {
  assignProject,
  closeProject,
  createSubProject,
  fetchSubProjectPermissions,
  grantSubProjectPermission,
  revokeSubProjectPermission
} from "../SubProjects/actions";
import { cleanUserAssignments, disableUser, enableUser, fetchGroups, fetchUserAssignments } from "../Users/actions";
import {
  assignSubproject,
  assignWorkflowItem,
  closeSubproject,
  closeWorkflowItem,
  createWorkflowItemAction,
  fetchWorkflowItemPermissions,
  grantWorkflowItemPermission,
  revokeWorkflowItemPermission,
  storeRejectReason
} from "../Workflows/actions";

import {
  additionalActionUpdateRequired,
  cancelConfirmation,
  closeConfirmation,
  confirmConfirmation,
  executeConfirmedActions,
  showValidationErrorMessage,
  storeAdditionalActions,
  storePostActions,
  storeRequestedPermissions
} from "./actions";
import ConfirmationDialog from "./ConfirmationDialog";
import { applyOriginalActions, createAdditionalActions } from "./createAdditionalActions";
import { executeActions } from "./executeActions";

class ConfirmationContainer extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.router.location.pathname !== prevProps.router.location.pathname) {
      this.props.cancelConfirmation();
    }

    if (this.props.isPayloadValidationFailed) {
      this.props.showValidationErrorMessage();
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
      const [additionalActions, postActions] = createAdditionalActions(
        this.props.originalActions,
        this.props.permissions,
        this.props.project,
        this.props.subproject,
        this.props.confirmingUser,
        this.props.groups
      );

      this.props.storeAdditionalActions(additionalActions);
      this.props.storePostActions(postActions);
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

    // Close confirmation dialog only after all component-updates rendered
    if (this.props.confirmationFinished !== prevProps.confirmationFinished) {
      this.props.closeConfirmation();
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

  executeAllActions = () => {
    this.props.confirmConfirmation();
    executeActions({
      actions: this.props.originalActions,
      assignProject: this.props.assignProject,
      assignSubproject: this.props.assignSubproject,
      assignWorkflowitem: this.props.assignWorkflowitem,
      createWorkflowitem: this.props.createWorkflowitem,
      createSubProject: this.props.createSubProject,
      grantProjectPermission: this.props.grantProjectPermission,
      revokeProjectPermission: this.props.revokeProjectPermission,
      grantSubprojectPermission: this.props.grantSubprojectPermission,
      revokeSubprojectPermission: this.props.revokeSubprojectPermission,
      grantWorkflowitemPermission: this.props.grantWorkflowitemPermission,
      revokeWorkflowitemPermission: this.props.revokeWorkflowitemPermission,
      closeProject: this.props.closeProject,
      closeSubproject: this.props.closeSubproject,
      closeWorkflowItem: this.props.closeWorkflowItem,
      disableUser: this.props.disableUser,
      enableUser: this.props.enableUser
    });
  };

  includesPermissionIntent(originalActions) {
    return originalActions.some((originalAction) => {
      const intent = originalAction.intent.split(".")[originalAction.intent.split(".").length - 1];
      return intent === "grantPermission" || intent === "revokePermission";
    });
  }

  render() {
    const {
      cancelConfirmation,
      confirmationDialogOpen,
      originalActions,
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
      enabledUsers,
      disabledUsers,
      fetchUserAssignments,
      cleanUserAssignments,
      userAssignments,
      postActions,
      executeConfirmedActions,
      failedPostAction,
      postActionsExecuted,
      executingPostActions,
      executedPostActions,
      executedOriginalActions,
      executingOriginalActions,
      originalActionsExecuted,
      failedOriginalAction,
      storeRejectReason,
      rejectReason,
      failureMessage
    } = this.props;

    if (confirmationDialogOpen) {
      return (
        <ConfirmationDialog
          open={true}
          originalActions={originalActions}
          executeConfirmedActions={executeConfirmedActions}
          onCancel={cancelConfirmation}
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
          enabledUsers={enabledUsers}
          disabledUsers={disabledUsers}
          fetchUserAssignments={fetchUserAssignments}
          cleanUserAssignments={cleanUserAssignments}
          userAssignments={userAssignments}
          postActions={postActions}
          failedPostAction={failedPostAction}
          postActionsExecuted={postActionsExecuted}
          executingPostActions={executingPostActions}
          executedPostActions={executedPostActions}
          executeAllActions={this.executeAllActions}
          executedOriginalActions={executedOriginalActions}
          executingOriginalActions={executingOriginalActions}
          originalActionsExecuted={originalActionsExecuted}
          failedOriginalAction={failedOriginalAction}
          storeRejectReason={storeRejectReason}
          rejectReason={rejectReason}
          failureMessage={failureMessage}
        />
      );
    } else {
      return null;
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchGroups: () => dispatch(fetchGroups(false)),
    fetchProjectPermissions: (pId) => dispatch(fetchProjectPermissions(pId, false)),
    fetchSubprojectPermissions: (pId, sId) => dispatch(fetchSubProjectPermissions(pId, sId, false)),
    fetchWorkflowitemPermissions: (pId, spId, wId) => dispatch(fetchWorkflowItemPermissions(pId, spId, wId, false)),
    showValidationErrorMessage: () => dispatch(showValidationErrorMessage()),
    confirmConfirmation: () => dispatch(confirmConfirmation()),
    closeConfirmation: () => dispatch(closeConfirmation()),
    cancelConfirmation: (permissions) => dispatch(cancelConfirmation(permissions)),
    executeConfirmedActions: (actionType, actions, pId, subId, wId) =>
      dispatch(executeConfirmedActions(actionType, actions, pId, subId, wId, false)),
    storeAdditionalActions: (actions) => dispatch(storeAdditionalActions(actions)),
    storePostActions: (actions) => dispatch(storePostActions(actions)),
    storeRequestedPermissions: (permissions) => dispatch(storeRequestedPermissions(permissions)),
    assignProject: (projectId, projectDisplayName, assigneeId, assigneeDisplayName, additionalActions) =>
      dispatch(assignProject(projectId, projectDisplayName, assigneeId, assigneeDisplayName, additionalActions)),
    assignSubproject: (pId, pDisplayName, subpId, subpName, assigneeId, assigneeName, additionalActions) =>
      dispatch(assignSubproject(pId, pDisplayName, subpId, subpName, assigneeId, assigneeName, additionalActions)),
    assignWorkflowitem: (
      pId,
      pDisplayName,
      subpId,
      subpName,
      wId,
      wName,
      assigneeId,
      assigneeName,
      additionalActions
    ) =>
      dispatch(
        assignWorkflowItem(pId, pDisplayName, subpId, subpName, wId, wName, assigneeId, assigneeName, additionalActions)
      ),
    createWorkflowitem: (...workflowitemData) => dispatch(createWorkflowItemAction(...workflowitemData)),
    createSubProject: (...subprojectToAdd) => dispatch(createSubProject(...subprojectToAdd)),
    grantProjectPermission: (pId, pName, permission, granteeId, granteeName, additionalActions) =>
      dispatch(grantProjectPermission(pId, pName, permission, granteeId, granteeName, additionalActions, true)),
    revokeProjectPermission: (pId, pName, permission, revokeeId, revokeeName) =>
      dispatch(revokeProjectPermission(pId, pName, permission, revokeeId, revokeeName, true)),
    grantSubprojectPermission: (pId, pName, sId, sName, permission, granteeId, granteeName, additionalActions) =>
      dispatch(
        grantSubProjectPermission(pId, pName, sId, sName, permission, granteeId, granteeName, additionalActions, true)
      ),
    revokeSubprojectPermission: (pId, pName, sId, sName, permission, revokeeId, revokeeName) =>
      dispatch(revokeSubProjectPermission(pId, pName, sId, sName, permission, revokeeId, revokeeName, true)),
    grantWorkflowitemPermission: (
      pId,
      pName,
      sId,
      sName,
      wId,
      wName,
      permission,
      granteeId,
      granteeName,
      additionalActions
    ) =>
      dispatch(
        grantWorkflowItemPermission(
          pId,
          pName,
          sId,
          sName,
          wId,
          wName,
          permission,
          granteeId,
          granteeName,
          additionalActions,
          true
        )
      ),
    revokeWorkflowitemPermission: (pId, pName, sId, sName, wId, wName, permission, revokeeId, revokeeName) =>
      dispatch(
        revokeWorkflowItemPermission(pId, pName, sId, sName, wId, wName, permission, revokeeId, revokeeName, true)
      ),
    additionalActionUpdateRequired: (required) => dispatch(additionalActionUpdateRequired(required)),
    closeProject: (pId) => dispatch(closeProject(pId, true)),
    closeSubproject: (pId, sId) => dispatch(closeSubproject(pId, sId, true)),
    closeWorkflowItem: (pId, sId, wId, isRejected) => dispatch(closeWorkflowItem(pId, sId, wId, isRejected, true)),
    disableUser: (userId) => dispatch(disableUser(userId)),
    enableUser: (userId) => dispatch(enableUser(userId)),
    fetchUserAssignments: (userId) => dispatch(fetchUserAssignments(userId)),
    cleanUserAssignments: () => dispatch(cleanUserAssignments()),
    storeRejectReason: (reason) => dispatch(storeRejectReason(reason))
  };
};

const mapStateToProps = (state) => {
  return {
    confirmationDialogOpen: state.getIn(["confirmation", "open"]),
    confirmationFinished: state.getIn(["confirmation", "confirmationFinished"]),
    originalActions: state.getIn(["confirmation", "originalActions"]),
    executedOriginalActions: state.getIn(["confirmation", "executedOriginalActions"]),
    executingOriginalActions: state.getIn(["confirmation", "executingOriginalActions"]),
    failedOriginalAction: state.getIn(["confirmation", "failedOriginalAction"]),
    confirmDisabled: state.getIn(["confirmation", "disabled"]),
    permissions: state.getIn(["confirmation", "permissions"]),
    confirmingUser: state.getIn(["login", "id"]),
    enabledUsers: state.getIn(["login", "enabledUsers"]),
    disabledUsers: state.getIn(["login", "disabledUsers"]),
    isFetchingProjectPermissions: state.getIn(["confirmation", "isFetchingProjectPermissions"]),
    isFetchingSubprojectPermissions: state.getIn(["confirmation", "isFetchingSubprojectPermissions"]),
    isFetchingWorkflowitemPermissions: state.getIn(["confirmation", "isFetchingWorkflowitemPermissions"]),
    executedAdditionalActions: state.getIn(["confirmation", "executedAdditionalActions"]),
    executedPostActions: state.getIn(["confirmation", "executedPostActions"]),
    additionalActions: state.getIn(["confirmation", "additionalActions"]),
    postActions: state.getIn(["confirmation", "postActions"]),
    additionalActionsExecuted: state.getIn(["confirmation", "additionalActionsExecuted"]),
    postActionsExecuted: state.getIn(["confirmation", "postActionsExecuted"]),
    originalActionsExecuted: state.getIn(["confirmation", "originalActionsExecuted"]),
    executingPostActions: state.getIn(["confirmation", "executingPostActions"]),
    executingAdditionalActions: state.getIn(["confirmation", "executingAdditionalActions"]),
    confirmed: state.getIn(["confirmation", "confirmed"]),
    project: state.getIn(["confirmation", "project"]),
    subproject: state.getIn(["confirmation", "subproject"]),
    workflowitem: state.getIn(["confirmation", "workflowitem"]),
    originalActionsIncreased: state.getIn(["confirmation", "originalActionsIncreased"]),
    isListPermissionsRequiredFromApi: state.getIn(["confirmation", "isListPermissionsRequiredFromApi"]),
    failedAction: state.getIn(["confirmation", "failedAction"]),
    requestedPermissions: state.getIn(["confirmation", "requestedPermissions"]),
    isPayloadValidationFailed: state.getIn(["confirmation", "isPayloadValidationFailed"]),
    groups: state.getIn(["users", "groups"]),
    userAssignments: state.getIn(["users", "userAssignments"]),
    rejectReason: state.getIn(["workflow", "rejectReason"]),
    failureMessage: state.getIn(["confirmation", "failureMessage"])
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(toJS(ConfirmationContainer)));
