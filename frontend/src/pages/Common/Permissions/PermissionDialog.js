import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import React from "react";

import strings from "../../../localizeStrings";
import PermissionTable from "./PermissionsTable";

const createActions = (permissions, temporayPermissions) => {
  const actions = [];
  Object.keys(permissions).forEach(key => {
    const permissionIds = permissions[key];
    const temporaryPermissionIds = temporayPermissions[key];

    const revokeIds = permissionIds.filter(id => !temporaryPermissionIds.includes(id));
    if (revokeIds.length > 0) actions.push({ type: "revoke", permission: key, userIds: revokeIds });
    const grantIds = temporaryPermissionIds.filter(id => !permissionIds.includes(id));
    if (grantIds.length > 0) actions.push({ type: "grant", permission: key, userIds: grantIds });
  });

  return actions;
};

const PermissionDialog = props => {
  return (
    <Dialog
      disableRestoreFocus
      data-test="permission-container"
      open={props.permissionDialogShown}
      onClose={props.hidePermissionDialog}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <PermissionTable {...props} disabled={props.disabled} />
      </DialogContent>
      <DialogActions>
        <Button data-test="permission-close" color="secondary" onClick={props.hidePermissionDialog}>
          {strings.common.cancel}
        </Button>
        <Button
          data-test="permission-submit"
          color="primary"
          onClick={() => {
            const actions = createActions(props.permissions, props.temporaryPermissions);
            actions.forEach(action => {
              if (action.type === "grant") {
                action.userIds.forEach(user => {
                  props.grant(props.id, action.permission, user);
                });
              } else if (action.type === "revoke") {
                action.userIds.forEach(user => {
                  props.revoke(props.id, action.permission, user);
                });
              } else console.error("Not a recognized action", action.type);
            });
            props.hidePermissionDialog();
          }}
        >
          {strings.common.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionDialog;
