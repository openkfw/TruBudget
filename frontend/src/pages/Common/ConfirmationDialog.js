import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import strings from "../../localizeStrings";

/**
 * Confirmation Dialog Component
 *
 * Customize the Confirmation Dialog with following props:
 * open: Dialog open prop
 * title: Text set in the Dialog title
 * content: The content injected into the DialogContent Component
 * onConfirm: Replaces the default onClick Event on confirm
 * onCancel: Replaces the default onClick Event on cancel
 *
 */
const styles = {
  paperRoot: {
    width: "100%",
    overflow: "visible"
  }
};

const buildDialogActions = (intent, onConfirm, onCancel, confirmDisabled) => {
  const cancelButton = (
    <Button aria-label="cancel" data-test="confirmation-dialog-cancel" color="secondary" onClick={() => onCancel()}>
      {strings.common.cancel}
    </Button>
  );
  const confirmButton = (
    <Button
      aria-label="confirm"
      data-test="confirmation-dialog-confirm"
      color="primary"
      onClick={() => {
        onConfirm();
      }}
      disabled={confirmDisabled}
    >
      {intent}
    </Button>
  );
  const leftActions = <div key="leftactions">{cancelButton}</div>;
  const rightActions = <div key="rightactions">{confirmButton}</div>;

  return [leftActions, rightActions];
};

const ConfirmationDialog = props => {
  const { classes, open, onConfirm, onCancel, confirmDisabled } = props;
  let { title, content, intent } = props;

  // Helper text for new ConfirmationDialogs
  if (title === undefined) title = "Are you sure?";
  if (content === undefined) content = "Pass 'content' prop to ConfirmationDialog to edit this section";
  if (intent === undefined) intent = strings.common.confirm;

  return (
    <Dialog classes={{ paper: classes.paperRoot }} open={open} data-test="confirmation-dialog">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>{buildDialogActions(intent, onConfirm, onCancel, confirmDisabled)}</DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(ConfirmationDialog);
