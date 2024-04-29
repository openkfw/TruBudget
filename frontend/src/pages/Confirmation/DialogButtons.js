import React from "react";
import _isEmpty from "lodash/isEmpty";

import { Button, Typography } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";

import strings from "../../localizeStrings";

import "./DialogButtons.scss";

const DialogButtons = (props) => {
  const {
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
    submitable = true,
    hasFailure = false
  } = props;

  const totalActionsLength = additionalActions?.length + originalActions?.length + postActions?.length;

  return (
    <DialogActions className="confirmation-dialog-actions">
      {submitable && !hasFailure && (
        <div className="progress-info-typography-container">
          <Typography key="progressInfo" className="progress-info-typography" data-test="actions-counter">
            {strings.formatString(strings.preview.actions_done, executedActions.length, totalActionsLength)}
          </Typography>
        </div>
      )}

      {!hasFailure && (
        <Button
          disabled={executingActions || actionsAreExecuted}
          aria-label="cancel"
          data-test="confirmation-dialog-cancel"
          color={submitable ? "secondary" : "primary"}
          onClick={() => onCancel()}
        >
          {submitable ? strings.common.cancel : strings.common.ok}
        </Button>
      )}

      {submitable && !hasFailure && (
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

      {hasFailure && (
        <Button
          disabled={executingActions || actionsAreExecuted}
          aria-label="cancel"
          data-test="confirmation-dialog-cancel"
          color={submitable ? "secondary" : "primary"}
          onClick={() => onCancel()}
        >
          {strings.common.close}
        </Button>
      )}
    </DialogActions>
  );
};

export default DialogButtons;
