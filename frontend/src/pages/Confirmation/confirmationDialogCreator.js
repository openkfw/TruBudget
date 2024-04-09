import React from "react";
import _isEmpty from "lodash/isEmpty";

import { Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { formatString } from "../../helper";
import strings from "../../localizeStrings";
import DisableUserDialogContent from "../Users/DisableUserDialogContent";
import EnableUserDialogContent from "../Users/EnableUserDialogContent";

import WokflowRejectDialogContent from "./../Workflows/WokflowRejectDialogContent";
import ActionsTable from "./ActionsTable";
import DialogButtons from "./DialogButtons";
import ErrorTypography from "./ErrorTypography";
import PermissionRequired from "./PermissionRequired";

const ActionTypes = {
  ORIGINAL: 1,
  ADDITIONAL: 2,
  POST: 3
};
Object.freeze(ActionTypes);

export class ConfirmationDialogCreator {
  constructor(confirmationDialogProps, open, onCancel) {
    ({
      executedAdditionalActions: this.executedAdditionalActions,
      originalActions: this.originalActions,
      enabledUsers: this.enabledUsers,
      disabledUsers: this.disabledUsers,
      fetchUserAssignments: this.fetchUserAssignments,
      cleanUserAssignments: this.cleanUserAssignments,
      postActions: this.postActions,
      failedAction: this.failedAction,
      additionalActionsExecuted: this.additionalActionsExecuted,
      executingAdditionalActions: this.executingAdditionalActions,
      failedPostAction: this.failedPostAction,
      postActionsExecuted: this.postActionsExecuted,
      executingPostActions: this.executingPostActions,
      executedPostActions: this.executedPostActions,
      executeAllActions: this.executeAllActions,
      executedOriginalActions: this.executedOriginalActions,
      executingOriginalActions: this.executingOriginalActions,
      originalActionsExecuted: this.originalActionsExecuted,
      failedOriginalAction: this.failedOriginalAction,
      groups: this.groups,
      additionalActions: this.additionalActions,
      userAssignments: this.userAssignments,
      requestedPermissions: this.requestedPermissions,
      permittedToGrant: this.permittedToGrant,
      hasAssignments: this.hasAssignments,
      storeRejectReason: this.storeRejectReason,
      rejectReason: this.rejectReason,
      failureMessage: this.failureMessage
    } = confirmationDialogProps);

    this.open = open;
    this.onCancel = onCancel;
  }

  createActionsTableDialog() {
    const allUsers = [...this.enabledUsers, ...this.disabledUsers];
    const assignments = {
      userAssignments: this.userAssignments,
      fetchUserAssignments: this.fetchUserAssignments,
      cleanUserAssignments: this.cleanUserAssignments
    };
    const additionalActionsExist = _additionalActionsExist(this.additionalActions);
    const marginTop = additionalActionsExist ? { marginTop: "28px" } : {};

    const actionTableData = {
      originalActions: this.originalActions,
      executedOriginalActions: this.executedOriginalActions,
      executingOriginalActions: this.executingOriginalActions,
      additionalActions: this.additionalActions,
      executedAdditionalActions: this.executedAdditionalActions,
      executingAdditionalActions: this.executingAdditionalActions,
      postActions: this.postActions,
      executingPostActions: this.executingPostActions,
      executedPostActions: this.executedPostActions,
      failedAction: this.failedAction,
      failedPostAction: this.failedPostAction,
      failedOriginalAction: this.failedOriginalAction,
      enabledUsers: this.enabledUsers,
      groups: this.groups,
      storeRejectReason: this.storeRejectReason
    };

    const { title, content, confirmButtonText } = _createActionTableDialogContent(
      this.originalActions,
      actionTableData,
      allUsers,
      assignments,
      marginTop,
      this.failureMessage
    );
    const errorInformation = !_isEmpty(this.failedAction) ? _createErrorInformation(this.failedAction) : null;

    const hasFailure = this.failureMessage !== "";

    return this._createDialog(title, content, confirmButtonText, errorInformation, true, hasFailure);
  }

  // It is possible for an User to not have sufficient permissions to perform all "AdditionalActions"
  // in that case, the Dialog is filled with the PermissionRequired Component
  createPermissionRequiredDialog(grantPermissionUserMap) {
    return this._createDialog(
      strings.confirmation.permissions_required,
      <PermissionRequired
        grantPermissionUserMap={grantPermissionUserMap}
        actions={this.additionalActions}
      ></PermissionRequired>,
      strings.common.confirm,
      null,
      false
    );
  }

  _createDialog(title, content, confirmButtonText, errorInformation, submitable, hasFailure) {
    return (
      <Dialog sx={{ overflow: "visible" }} maxWidth={"xl"} open={this.open} data-test="confirmation-dialog">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        {errorInformation}
        <DialogButtons
          confirmButtonText={confirmButtonText}
          onConfirm={this.executeAllActions}
          onCancel={this.requestedPermissions ? () => this.onCancel(this.requestedPermissions) : this.onCancel}
          confirmDisabled={
            (!this.permittedToGrant && _additionalActionsExist(this.additionalActions)) ||
            this.hasAssignments ||
            (this.rejectReason.length === 0 && _isWorkflowItemReject(this.originalActions))
          }
          additionalActions={this.additionalActions}
          originalActions={this.originalActions}
          postActions={this.postActions}
          executedActions={[
            ...this.executedAdditionalActions,
            ...this.executedOriginalActions,
            ...this.executedPostActions
          ]}
          actionsAreExecuted={
            this.additionalActionsExecuted || this.originalActionsExecuted || this.postActionsExecuted
          }
          executingActions={
            this.executingAdditionalActions || this.executingOriginalActions || this.executingPostActions
          }
          failedAction={this.failedAction}
          submitable={submitable}
          hasFailure={hasFailure}
        />
      </Dialog>
    );
  }
}

const _createDialogContent = (actionTableData, originalAction, marginTop) => {
  const additionalActionsContent = _createAdditionalActionsContent(originalAction, actionTableData);
  const createdConfirmButtonText = additionalActionsContent ? strings.confirmation.execute_actions : undefined;
  const postActions = actionTableData.postActions;

  let createdContent = (
    <>
      {additionalActionsContent}
      <div style={marginTop}>
        <Typography>{strings.confirmation.original_actions}</Typography>
        {_createActionsTable(actionTableData, ActionTypes.ORIGINAL)}
      </div>
    </>
  );

  if (!_isEmpty(postActions)) {
    const postActionsDialogText = strings.confirmation.post_actions_dialog_text;

    createdContent = (
      <>
        {createdContent}
        <div style={{ marginTop: "28px" }}>
          <Typography>{postActionsDialogText}</Typography>
          {_createActionsTable(actionTableData, ActionTypes.POST)}
        </div>
      </>
    );
  }

  return { createdContent, createdConfirmButtonText };
};

const _createToggleUserContent = (actionTableData, originalAction, marginTop) => {
  const { payload, intent } = originalAction;

  switch (intent) {
    case "global.enableUser":
      return _createEnableUserContent(actionTableData, payload, marginTop);
    case "global.disableUser":
      return _createDisableUserContent(actionTableData, payload, marginTop);
    default:
      return {};
  }
};

const _createEnableUserContent = (actionTableData, payload, marginTop) => {
  const createdTitle = formatString(strings.users.enable_userId, payload.userId);
  const createdContent = (
    <>
      <EnableUserDialogContent editId={payload.userId} />
      <div style={marginTop}>
        <Typography>{strings.confirmation.original_actions}</Typography>
        {_createActionsTable(actionTableData, ActionTypes.ORIGINAL)}
      </div>
    </>
  );
  const createdConfirmButtonText = strings.users.enable_user;

  return { createdContent, createdTitle, createdConfirmButtonText };
};

const _createDisableUserContent = (actionTableData, payload, marginTop) => {
  const createdTitle = formatString(strings.users.disable_userId, payload.userId);
  const { fetchUserAssignments, cleanUserAssignments, userAssignments, ...restActionTableData } = actionTableData;
  const createdContent = (
    <>
      <DisableUserDialogContent
        fetchUserAssignments={fetchUserAssignments}
        cleanUserAssignments={cleanUserAssignments}
        userAssignments={userAssignments}
        editId={payload.userId}
      />
      <div style={marginTop}>
        <Typography>{strings.confirmation.original_actions}</Typography>
        {_createActionsTable(restActionTableData, ActionTypes.ORIGINAL)}
      </div>
    </>
  );
  const createdConfirmButtonText = strings.users.disable_user;

  return { createdContent, createdTitle, createdConfirmButtonText };
};

const _createActionTableDialogContent = (
  originalActions,
  actionTableData,
  allUsers,
  assignments,
  marginTop,
  failureMessage
) => {
  let content = undefined;
  let confirmButtonText = strings.common.confirm;
  let title = strings.confirmation.confirmation_required;

  if (failureMessage !== "") {
    content = "Error: " + failureMessage + ". Please try again later";
    return { content, title, confirmButtonText };
  }

  for (const originalAction of originalActions) {
    const intent = originalAction.intent;

    // Payload is defined by the saga which triggers the CONFIRM_INTENT-action
    switch (intent) {
      case "project.assign":
      case "subproject.assign":
      case "workflowitem.assign":
      case "project.createSubproject":
      case "subproject.createWorkflowitem":
      case "project.intent.grantPermission":
      case "project.intent.revokePermission":
      case "subproject.intent.grantPermission":
      case "subproject.intent.revokePermission":
      case "workflowitem.intent.grantPermission":
      case "workflowitem.intent.revokePermission": {
        const { createdContent, createdConfirmButtonText } = _createDialogContent(
          actionTableData,
          originalAction,
          marginTop
        );

        confirmButtonText = createdConfirmButtonText ? createdConfirmButtonText : confirmButtonText;
        content = createdContent;

        break;
      }

      case "project.close":
      case "subproject.close":
      case "workflowitem.close": {
        const textContainer = _createCloseTexts(originalAction, actionTableData.storeRejectReason);

        title = textContainer.closeTitle;
        content = textContainer.closeContent;
        confirmButtonText = textContainer.closeConfirmButtonText;

        break;
      }

      case "global.enableUser":
      case "global.disableUser": {
        const toggleUserActionTableData = {
          ...actionTableData,
          enabledUsers: allUsers,
          userAssignments: assignments.userAssignments,
          fetchUserAssignments: assignments.fetchUserAssignments,
          cleanUserAssignments: assignments.cleanUserAssignments
        };

        const { createdContent, createdTitle, createdConfirmButtonText } = _createToggleUserContent(
          toggleUserActionTableData,
          originalAction,
          marginTop
        );

        content = createdContent;
        title = createdTitle;
        confirmButtonText = createdConfirmButtonText;

        break;
      }

      default:
        title = "Not implemented confirmation";
        content = "Confirmation Dialog for " + intent + " is not implemented yet";
        break;
    }
  }

  return { content, title, confirmButtonText };
};

const _createAdditionalActionsContent = (originalAction, actionTableData) => {
  if (!_additionalActionsExist(actionTableData.additionalActions)) {
    return;
  }

  const { intent, payload } = originalAction;
  const dialogText = _createAdditionalActionsText(intent, payload);

  return (
    <>
      <Typography>{dialogText}</Typography>
      {_createActionsTable(actionTableData, ActionTypes.ADDITIONAL)}
    </>
  );
};

const _createErrorInformation = (failedAction) => {
  return (
    <ErrorTypography
      type="error"
      text={formatString(strings.confirmation.failed_action_error, failedAction.permission, failedAction.identity)}
    />
  );
};

const _createActionsTable = (actionTableData, actionType) => {
  const { enabledUsers, groups, ...restActionTableData } = actionTableData;

  const { actions, executedActions, executingActions, failedAction } = _getActionTableDataOfType(
    restActionTableData,
    actionType
  );

  const dataTest = _getDataTestOfType(actionType);

  return (
    <ActionsTable
      data-test={dataTest}
      actions={actions}
      executedActions={executedActions}
      executingActions={executingActions}
      failedAction={failedAction}
      users={enabledUsers}
      groups={groups}
    />
  );
};

const _getDataTestOfType = (actionType) => {
  switch (actionType) {
    case ActionTypes.POST:
      return "post-actions";

    case ActionTypes.ADDITIONAL:
      return "additional-actions";

    case ActionTypes.ORIGINAL:
    default:
      return "original-actions";
  }
};

const _getActionTableDataOfType = (actionTableData, actionType) => {
  switch (actionType) {
    case ActionTypes.POST:
      return {
        actions: actionTableData.postActions,
        executedActions: actionTableData.executedPostActions,
        executingActions: actionTableData.executingPostActions,
        failedAction: actionTableData.failedPostAction
      };
    case ActionTypes.ADDITIONAL:
      return {
        actions: actionTableData.additionalActions,
        executedActions: actionTableData.executedAdditionalActions,
        executingActions: actionTableData.executingAdditionalActions,
        failedAction: actionTableData.failedAction
      };
    case ActionTypes.ORIGINAL:
    default:
      return {
        actions: actionTableData.originalActions,
        executedActions: actionTableData.executedOriginalActions,
        executingActions: actionTableData.executingOriginalActions,
        failedAction: actionTableData.failedOriginalAction
      };
  }
};

const _isWorkflowItemReject = (originalActions) =>
  originalActions.some((action) => action.intent === "workflowitem.close") &&
  originalActions.some((action) => action.payload.isRejectDialog === true);

const _createCloseTexts = (originalAction, storeRejectReason) => {
  const { intent, payload } = originalAction;

  switch (intent) {
    case "project.close":
      return _createCloseProjectText();

    case "subproject.close":
      return _createCloseSubProjectText();

    case "workflowitem.close":
      return _createCloseWorkflowItemText(payload, storeRejectReason);

    default:
      return {};
  }
};

const _createAdditionalActionsText = (intent, payload) => {
  switch (intent) {
    case "project.assign":
      return formatString(
        strings.confirmation.permissions_text,
        payload.assignee.displayName,
        strings.common.project,
        payload.project.displayName
      );

    case "subproject.assign":
      return formatString(
        strings.confirmation.permissions_text,
        payload.assignee.displayName,
        strings.common.subproject,
        payload.subproject.displayName
      );

    case "workflowitem.assign":
      return formatString(
        strings.confirmation.permissions_text,
        payload.assignee.displayName,
        strings.common.workflowitem,
        payload.workflowitem.displayName
      );

    case "project.intent.grantPermission":
    case "project.intent.revokePermission":
    case "subproject.intent.grantPermission":
    case "subproject.intent.revokePermission":
    case "workflowitem.intent.grantPermission":
    case "workflowitem.intent.revokePermission":
      return strings.confirmation.additional_permissions_dialog_text;

    default:
      return "";
  }
};

const _createCloseProjectText = () => {
  const dialogText = strings.confirmation.project_close_text;
  const closeTitle = strings.confirmation.project_close;

  return {
    closeTitle,
    closeContent: <Typography>{dialogText}</Typography>,
    closeConfirmButtonText: closeTitle
  };
};

const _createCloseSubProjectText = () => {
  const dialogText = strings.confirmation.subproject_close_text;
  const closeTitle = strings.confirmation.subproject_close;

  return {
    closeTitle,
    closeContent: <Typography>{dialogText}</Typography>,
    closeConfirmButtonText: closeTitle
  };
};

const _createCloseWorkflowItemText = (payload, storeRejectReason) => {
  if (payload.isRejectDialog) {
    return _createRejectWorkflowItemText(storeRejectReason);
  }

  const dialogText = strings.confirmation.workflowitem_close_text;
  const closeTitle = strings.confirmation.workflowitem_close;

  return {
    closeTitle,
    closeContent: <Typography>{dialogText}</Typography>,
    closeConfirmButtonText: closeTitle
  };
};

const _createRejectWorkflowItemText = (storeRejectReason) => {
  const dialogText = {
    commentLabel: strings.common.comment,
    commentPlaceholder: strings.common.comment_description
  };
  return {
    closeTitle: strings.confirmation.workflowitem_close_reject,
    closeContent: <WokflowRejectDialogContent text={dialogText} storeRejectReason={storeRejectReason} />,
    closeConfirmButtonText: strings.common.reject
  };
};

const _additionalActionsExist = (additionalActions) => {
  return !_isEmpty(additionalActions);
};
