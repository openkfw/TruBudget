import { Button } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import { withStyles } from "@material-ui/core/styles";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import strings from "../../localizeStrings";

const styles = {
  dialogActions: {
    margin: "8px 4px 8px 24px"
  },
  progessContainer: {
    flex: "auto"
  },
  progressInfo: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start"
  }
};

const DialogButtons = props => {
  const {
    classes,
    confirmButtonText,
    onConfirm,
    onCancel,
    confirmDisabled,
    additionalActions = [],
    originalActions = [],
    postActions = [],
    executedActions = [],
    actionsAreExecuted,
    executingActions,
    failedAction,
    submitable = true
  } = props;

  const totalActionsLength = additionalActions?.length + originalActions?.length + postActions?.length;

  return (
    <DialogActions className={classes.dialogActions}>
      {submitable && (
        <div className={classes.progessContainer}>
          <Typography key="progressInfo" className={classes.progressInfo} data-test="actions-counter">
            {strings.formatString(strings.preview.actions_done, executedActions.length, totalActionsLength)}
          </Typography>
        </div>
      )}

      <Button
        disabled={executingActions || actionsAreExecuted}
        aria-label="cancel"
        data-test="confirmation-dialog-cancel"
        color={submitable ? "secondary" : "primary"}
        onClick={() => onCancel()}
      >
        {submitable ? strings.common.cancel : strings.common.ok}
      </Button>

      {submitable && (
        <Button
          aria-label="confirm"
          data-test="confirmation-dialog-confirm"
          color="primary"
          onClick={_isEmpty(failedAction) ? () => onConfirm() : () => onCancel()}
          disabled={confirmDisabled || executingActions || actionsAreExecuted}
        >
          {confirmButtonText}
        </Button>
      )}
    </DialogActions>
  );
};

export default withStyles(styles)(DialogButtons);
