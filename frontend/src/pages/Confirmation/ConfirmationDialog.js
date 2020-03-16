import { Button, CircularProgress, DialogActions, Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { withStyles } from "@material-ui/core/styles";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import { formatString } from "../../helper";
import strings from "../../localizeStrings";
import ActionsTable from "./ActionsTable";
import DialogButtons from "./DialogButtons";
import ErrorTypography from "./ErrorTypography";

const styles = {
  paperRoot: {
    width: "100%",
    overflow: "visible",
    maxWidth: "800px"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "top",
    justifyContent: "center",
    marginRight: "50px"
  },
  loadingIndicator: {
    display: "inline-block",
    position: "relative",
    padding: "50px"
  },
  dialogContent: {
    paddingBottom: "0px"
  }
};

// Implement a new confirmation dialog by setting title, content and confirmButtonText
const ConfirmationDialog = props => {
  const {
    classes,
    open = false,
    permissions,
    confirmingUser,
    groups,
    executedAdditionalActions,
    additionalActions,
    additionalActionsExecuted,
    executingAdditionalActions,
    originalActions,
    project,
    subproject,
    requestedPermissions,
    failedAction,
    onCancel,
    listPermissionsRequired,
    isFetchingPermissions,
    permissionsEmpty,
    userList
  } = props;

  // If permissions are not fetched yet show Loading indicator
  if (isFetchingPermissions || permissionsEmpty || listPermissionsRequired) {
    return buildDialogWithLoadingIndicator(classes, open, listPermissionsRequired, onCancel, requestedPermissions);
  }

  let title, content;
  let confirmButtonText = strings.common.confirm;
  let doneButtonText = strings.common.done;
  let permittedToGrant = false;

  originalActions.forEach(originalAction => {
    const { intent, payload } = originalAction;

    // Payload is defined by the saga which triggers the CONFIRM_INTENT-action
    switch (intent) {
      case "project.assign":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = formatString(
            strings.confirmation.permissions_text,
            payload.assignee.displayName,
            strings.common.project,
            payload.project.displayName
          );

          title = strings.confirmation.additional_permissions_required;
          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={userList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
          doneButtonText = strings.common.assign;
        } else {
          const dialogText = formatString(
            strings.confirmation.assigning_text,
            payload.assignee.displayName,
            strings.common.project,
            payload.project.displayName
          );

          title = strings.confirmation.confirm_assign;
          content = <Typography>{dialogText}</Typography>;
          confirmButtonText = strings.common.assign;
        }
        break;
      case "subproject.assign":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = formatString(
            strings.confirmation.permissions_text,
            payload.assignee.displayName,
            strings.common.subproject,
            payload.subproject.displayName
          );

          title = strings.confirmation.additional_permissions_required;
          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={userList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
          doneButtonText = strings.common.assign;
        } else {
          const dialogText = formatString(
            strings.confirmation.assigning_text,
            payload.assignee.displayName,
            strings.common.subproject,
            payload.subproject.displayName
          );

          title = strings.confirmation.confirm_assign;
          content = <Typography>{dialogText}</Typography>;
          confirmButtonText = strings.common.assign;
        }
        break;
      case "workflowitem.assign":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = formatString(
            strings.confirmation.permissions_text,
            payload.assignee.displayName,
            strings.common.workflowitem,
            payload.workflowitem.displayName
          );

          title = strings.confirmation.additional_permissions_required;
          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={userList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
          doneButtonText = strings.common.assign;
        } else {
          const dialogText = formatString(
            strings.confirmation.assigning_text,
            payload.assignee.displayName,
            strings.common.workflowitem,
            payload.workflowitem.displayName
          );

          title = strings.confirmation.confirm_assign;
          content = <Typography>{dialogText}</Typography>;
          confirmButtonText = strings.common.assign;
        }
        break;
      case "project.intent.grantPermission":
      case "project.intent.revokePermission":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = strings.confirmation.additional_permissions_dialog_text;

          title = strings.confirmation.additional_permissions_required;
          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={userList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
          doneButtonText = strings.common.grant + "/" + strings.common.revoke;
        } else {
          const dialogText = strings.confirmation.update_permissions_dialog_text;

          title = strings.confirmation.confirm_update_permissions;
          content = <Typography>{dialogText}</Typography>;
          confirmButtonText = strings.common.grant + "/" + strings.common.revoke;
        }
        break;
      case "subproject.intent.grantPermission":
      case "subproject.intent.revokePermission":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = strings.confirmation.additional_permissions_dialog_text;

          title = strings.confirmation.additional_permissions_required;
          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={userList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
          doneButtonText = strings.common.grant + "/" + strings.common.revoke;
        } else {
          const dialogText = strings.confirmation.update_permissions_dialog_text;

          title = strings.confirmation.confirm_update_permissions;
          content = <Typography>{dialogText}</Typography>;
          confirmButtonText = strings.common.grant + "/" + strings.common.revoke;
        }
        break;

      case "workflowitem.intent.grantPermission":
      case "workflowitem.intent.revokePermission":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);
        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = strings.confirmation.additional_permissions_dialog_text;

          title = strings.confirmation.additional_permissions_required;
          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={userList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
          doneButtonText = strings.common.grant + "/" + strings.common.revoke;
        } else {
          const dialogText = strings.confirmation.update_permissions_dialog_text;

          title = strings.confirmation.confirm_update_permissions;
          content = <Typography>{dialogText}</Typography>;
          confirmButtonText = strings.common.grant + "/" + strings.common.revoke;
        }
        break;
      default:
        title = "Not implemented confirmation";
        content = "Confirmation Dialog for " + intent + " is not implemented yet";
        break;
    }
  });

  const executeActions = () => {
    if (additionalActionsExist(additionalActions))
      props.executeConfirmedActions(additionalActions, project.id, subproject ? subproject.id : undefined);
  };

  return (
    <Dialog classes={{ paper: classes.paperRoot }} open={open} data-test="confirmation-dialog">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      {renderErrorInformation(permittedToGrant, additionalActions, failedAction)}
      <DialogButtons
        confirmButtonText={confirmButtonText}
        doneButtonText={doneButtonText}
        onConfirm={_isEmpty(additionalActions) || additionalActionsExecuted ? props.onConfirm : executeActions}
        onCancel={requestedPermissions ? () => onCancel(requestedPermissions) : onCancel}
        confirmDisabled={!permittedToGrant && additionalActionsExist(additionalActions)}
        actions={additionalActions}
        executedActions={executedAdditionalActions}
        actionsAreExecuted={additionalActionsExecuted}
        executingActions={executingAdditionalActions}
        failedAction={failedAction}
      />
    </Dialog>
  );
};

function buildDialogWithLoadingIndicator(classes, open, listPermissionsRequired, onCancel, requestedPermissions) {
  return (
    <Dialog classes={{ paper: classes.paperRoot }} open={open} data-test="confirmation-dialog">
      {listPermissionsRequired ? (
        <React.Fragment>
          <DialogTitle data-test="confirmation-dialog-title">{strings.confirmation.permissions_required}</DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Typography>{strings.confirmation.list_permissions_required_text}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => onCancel(requestedPermissions)}
              data-test="confirmation-dialog-close"
            >
              {strings.common.close}
            </Button>
          </DialogActions>
        </React.Fragment>
      ) : (
        <div className={classes.loadingContainer}>
          <CircularProgress
            size={50}
            left={0}
            top={0}
            percentage={50}
            color="primary"
            className={classes.loadingIndicator}
          />
        </div>
      )}
    </Dialog>
  );
}

function additionalActionsExist(additionalActions) {
  return !_isEmpty(additionalActions);
}

function renderErrorInformation(permittedToGrant, additionalActions, failedAction) {
  if (!permittedToGrant && additionalActionsExist(additionalActions))
    return <ErrorTypography type="warning" text={strings.confirmation.no_permission_warning} />;
  if (!_isEmpty(failedAction)) {
    return (
      <ErrorTypography
        type="error"
        text={formatString(strings.confirmation.failed_action_error, failedAction.permission, failedAction.identity)}
      />
    );
  }
  return null;
}

function isPermittedToGrant(username, groups, permissions, actions) {
  const resourcesToCheck = actions.reduce((resourcesToCheck, action) => {
    const resource = action.intent.split(".")[0];
    if (!resourcesToCheck.includes(resource)) {
      resourcesToCheck.push(resource);
    }
    return resourcesToCheck;
  }, []);

  //check permission by username
  const isUserPermitted = resourcesToCheck.every(resource => {
    return permissions[resource][`${resource}.intent.grantPermission`].includes(username);
  });

  if (typeof groups === undefined || groups.length === 0 || groups == null) {
    return isUserPermitted;
  } else {
    //check permission by group
    const filteredGroups = groups.filter(item => item.users.includes(username));
    const groupIds = filteredGroups.map(item => item.groupId);

    const isGroupPermitted = resourcesToCheck.every(resource => {
      return permissions[resource][`${resource}.intent.grantPermission`].some(member => groupIds.includes(member));
    });

    return isUserPermitted || isGroupPermitted;
  }
}

export default withStyles(styles)(ConfirmationDialog);
