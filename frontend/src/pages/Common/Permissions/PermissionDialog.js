import React from "react";
import _isEmpty from "lodash/isEmpty";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import strings from "../../../localizeStrings";

import PermissionTable from "./PermissionsTable";

const createActions = (permissions, temporayPermissions) => {
  const actions = [];

  Object.keys(permissions).forEach((key) => {
    const permissionIds = permissions[key];
    const temporaryPermissionIds = temporayPermissions[key];

    const revokeIds = permissionIds.filter((id) => !temporaryPermissionIds.includes(id));
    if (revokeIds.length > 0) actions.push({ type: "revoke", permission: key, userIds: revokeIds });

    const grantIds = temporaryPermissionIds.filter((id) => !permissionIds.includes(id));
    if (grantIds.length > 0) actions.push({ type: "grant", permission: key, userIds: grantIds });
  });

  return actions;
};

const onSubmit = (submitProps) => {
  const { hidePermissionDialog, permissions, temporaryPermissions, ...actionFunctions } = submitProps;

  if (_isEmpty(permissions) || JSON.stringify(temporaryPermissions) === JSON.stringify(permissions)) {
    hidePermissionDialog();
    return;
  }

  const actions = createActions(permissions, temporaryPermissions);

  actions.forEach((action) => executeAction(action, actionFunctions));
};

const executeAction = (action, actionFunctions) => {
  const { grant, revoke } = actionFunctions;

  if (action.type === "grant") {
    action.userIds.forEach((user) => grant(action.permission, user));
    return;
  }

  if (action.type === "revoke") {
    action.userIds.forEach((user) => revoke(action.permission, user));
    return;
  }

  // eslint-disable-next-line no-console
  console.error("Not a recognized action", action.type);
};

const PermissionDialog = (props) => {
  const { open, disabledSubmit, disabledUserSelection, userList, ...submitProps } = props;
  return (
    <Dialog disableRestoreFocus data-test="permission-container" open={open} onClose={props.hidePermissionDialog}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <PermissionTable {...props} userList={userList} disabled={disabledUserSelection} />
      </DialogContent>
      <DialogActions>
        <Button data-test="permission-close" color="secondary" onClick={props.hidePermissionDialog}>
          {strings.common.cancel}
        </Button>
        <Button
          disabled={disabledSubmit}
          data-test="permission-submit"
          color="primary"
          onClick={() => onSubmit(submitProps)}
        >
          {strings.common.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionDialog;
