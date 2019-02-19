import React from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { withStyles } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import isEmpty from "lodash/isEmpty";
import strings from "../../localizeStrings";

const styles = {
  paperRoot: {
    width: "100%",
    overflow: "visible"
  }
};

const getDialogActions = props => {
  const { onDialogSubmit, onDialogCancel, onDialogDone, submitButtonText, disableCancelButton, submitDone } = props;
  const cancelButton = (
    <Button
      disabled={disableCancelButton}
      aria-label="cancel"
      data-test="cancel"
      color="secondary"
      onClick={() => onDialogCancel()}
    >
      {strings.common.cancel}
    </Button>
  );
  const submitButton = (
    <Button
      aria-label="submit"
      data-test="submit"
      color="primary"
      onClick={disableCancelButton ? () => onDialogCancel() : () => onDialogSubmit()}
    >
      {submitButtonText}
    </Button>
  );
  const doneButton = (
    <Button
      aria-label="done"
      data-test="done"
      color="primary"
      onClick={submitDone ? () => onDialogDone() : () => onDialogCancel()}
    >
      {submitButtonText}
    </Button>
  );

  const leftActions = <div key="leftactions">{cancelButton}</div>;
  const rightActions = <div key="rightactions">{disableCancelButton ? doneButton : submitButton}</div>;

  return [leftActions, rightActions];
};

const PreviewDialog = props => {
  const { dialogShown, title, classes } = props;
  return (
    <Dialog classes={{ paper: classes.paperRoot }} open={dialogShown} data-test="preview-dialog">
      <DialogTitle> {title}</DialogTitle>
      {props.preview}
      <DialogActions>{getDialogActions(props)}</DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(PreviewDialog);
