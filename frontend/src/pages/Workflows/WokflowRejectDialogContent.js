import TextField from "@mui/material/TextField";
import React from "react";

const WokflowRejectDialogContent = props => {
  const { storeRejectReason } = props;
  return (
    <>
      <TextField
        id="reject-reason-imput-field"
        style={{ width: "100%" }}
        label={props.text.commentLabel}
        multiline
        rows={4}
        placeholder={props.text.commentPlaceholder}
        variant="outlined"
        onChange={event => storeRejectReason(event.target.value)}
        required
        data-test="reject-workflowitem-reject-reason"
      />
    </>
  );
};
export default WokflowRejectDialogContent;
