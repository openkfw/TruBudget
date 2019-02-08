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

const getDialogActions = (props, handleCancel, handleSubmit, submitButtonText) => {
  const { subProjects } = props;
  const cancelButton = (
    <Button aria-label="cancel" data-test="cancel" color="secondary" onClick={() => handleCancel()}>
      {strings.common.cancel}
    </Button>
  );
  const submitButton = (
    <Button aria-label="submit" data-test="submit" color="primary" onClick={() => handleSubmit(subProjects)}>
      {!isEmpty(submitButtonText) ? submitButtonText : strings.common.submit}
    </Button>
  );

  const leftActions = <div key="leftactions">{cancelButton}</div>;
  const rightActions = <div key="rightactions">{submitButton}</div>;

  return [leftActions, rightActions];
};

const PreviewDialog = props => {
  const { dialogShown, title, classes, onDialogSubmit, onDialogCancel } = props;
  return (
    <Dialog classes={{ paper: classes.paperRoot }} open={dialogShown} data-test="preview-dialog">
      <DialogTitle> {title}</DialogTitle>
      {props.preview}
      <DialogActions>{getDialogActions(props, onDialogCancel, onDialogSubmit, strings.common.submit)}</DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(PreviewDialog);
