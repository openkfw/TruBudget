import React from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { withStyles, Typography } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import strings from "../../localizeStrings";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = {
  paperRoot: {
    width: "100%",
    overflow: "visible"
  }
};

const getDialogActions = props => {
  const {
    onDialogSubmit,
    onDialogCancel,
    onDialogDone,
    submitDone,
    nSubmittedItems,
    nItemsToSubmit,
    submitInProgress
  } = props;
  const cancelButton = (
    <Button
      disabled={submitDone || submitInProgress}
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
      disabled={submitInProgress}
      aria-label="submit"
      data-test="submit"
      color="primary"
      onClick={() => onDialogSubmit()}
    >
      {strings.common.submit}
    </Button>
  );
  const doneButton = (
    <Button aria-label="done" data-test="done" color="primary" onClick={() => onDialogDone()}>
      {strings.common.done}
    </Button>
  );
  const progressInfo = (
    <Typography key="progressInfo" style={{ flex: 1 }}>
      {nSubmittedItems} from {nItemsToSubmit} actions done
    </Typography>
  );
  const leftActions = <div key="leftactions">{cancelButton}</div>;
  const rightActions = <div key="rightactions">{submitDone ? doneButton : submitButton}</div>;

  return [progressInfo, leftActions, rightActions];
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
