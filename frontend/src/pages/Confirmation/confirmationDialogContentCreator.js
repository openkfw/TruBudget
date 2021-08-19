import React from "react";
import { Typography } from "@material-ui/core";
import _isEmpty from "lodash/isEmpty";

import ActionsTable from "./ActionsTable";
import DisableUserDialogContent from "../Users/DisableUserDialogContent";
import EnableUserDialogContent from "../Users/EnableUserDialogContent";

import strings from "../../localizeStrings";
import { formatString } from "../../helper";

const ActionTypes = {
  ORIGINAL: 1,
  ADDITIONAL: 2,
  POST :3
};
Object.freeze(ActionTypes);

export const createContent = ( actionTableData, originalAction, marginTop ) => {
  const additionalActionsContent = _createAdditionalActionsContent(originalAction, actionTableData);
  const createdConfirmButtonText = additionalActionsContent ? strings.confirmation.execute_actions : undefined;
  const postActions = actionTableData.postActions;

  let createdContent = (
    <>
      {additionalActionsContent}
      <div style={marginTop}>
        <Typography>{strings.confirmation.original_actions}</Typography>
        {_createActionsTable(actionTableData, ActionTypes.Original)}
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

  return {createdContent, createdConfirmButtonText};
};

export const createToggleUserContent = (actionTableData, originalAction, marginTop) => {
  const { payload, intent } = originalAction;

  switch(intent) {
    case "global.enableUser":
      return _createEnableUserContent(actionTableData, payload, marginTop);
    case "global.disableUser":
      return _createDisableUserContent(actionTableData, payload, marginTop);
    default:
      return {};
  }

};

export const createCloseTexts = (intent = "") => {
  switch(intent) {
    case "project.close":
      return _createCloseProjectText();

    case "subproject.close":
      return _createCloseSubProjectText();

    case "workflowitem.close":
      return _createCloseWorkflowItemText();

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

  return {createdContent, createdTitle, createdConfirmButtonText};
};

const _createDisableUserContent = (actionTableData, payload, marginTop) => {
  const createdTitle = formatString(strings.users.disable_userId, payload.userId);
  const {fetchUserAssignments, cleanUserAssignments, userAssignments, ...restActionTableData} = actionTableData;
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

  return {createdContent, createdTitle, createdConfirmButtonText};
};

const _createActionsTable = (actionTableData, actionType) => {
  const {
    enabledUsers,
    groups,
    ...restActionTableData
  } = actionTableData;

  const {
    actions,
    executedActions,
    executingActions,
    failedAction
  } = _getActionTableDataOfType(restActionTableData, actionType);

  const dataTest = _getDataTestOfType(actionType);

    return (
      <>
        <ActionsTable
          data-test={dataTest}
          actions={actions}
          executedActions={executedActions}
          executingActions={executingActions}
          failedAction={failedAction}
          users={enabledUsers}
          groups={groups}
          />
      </>
    );
};

const _getDataTestOfType = (actionType => {
  switch(actionType) {
    case ActionTypes.POST:
      return "post-actions";

    case ActionTypes.ADDITIONAL:
      return "additional-actions";

    case ActionTypes.ORIGINAL:
    default:
      return "original-actions";
  }
});

const _getActionTableDataOfType = (actionTableData, actionType) => {
  switch(actionType) {
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

const _createAdditionalActionsContent = (originalAction, actionTableData) => {
  if (!additionalActionsExist(actionTableData.additionalActions)) {
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

const _createAdditionalActionsText = (intent, payload) => {
  switch(intent) {
    case "project.assign":
      return formatString(
        strings.confirmation.permissions_text,
        payload.assignee.displayName,
        strings.common.project,
        payload.project.displayName);

    case "subproject.assign":
      return formatString(
        strings.confirmation.permissions_text,
        payload.assignee.displayName,
        strings.common.subproject,
        payload.subproject.displayName);

    case "workflowitem.assign":
      return formatString(
        strings.confirmation.permissions_text,
        payload.assignee.displayName,
        strings.common.workflowitem,
        payload.workflowitem.displayName);

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

const _createCloseWorkflowItemText = () => {
  const dialogText = strings.confirmation.workflowitem_close_text;
  const closeTitle = strings.confirmation.workflowitem_close;

  return {
    closeTitle,
    closeContent: <Typography>{dialogText}</Typography>,
    closeConfirmButtonText: closeTitle
  };
};

function additionalActionsExist(additionalActions) {
  return !_isEmpty(additionalActions);
};
