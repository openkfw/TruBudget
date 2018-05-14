import React from "react";
import Dialog, { DialogContent, DialogActions } from "material-ui/Dialog";

import Divider from "material-ui/Divider";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";
import _ from "lodash";
import { toAmountString, statusMapping } from "../../helper";
import DocumentOverview from "../Documents/DocumentOverview";
import strings from "../../localizeStrings";
import { Typography, DialogContentText } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";

const styles = {
  textfield: {
    width: "50%",
    right: -30
  },
  closeButton: {
    left: 650,
    position: "absolute",
    top: 20
  },
  avatarCard: {
    width: "45%",
    left: "35px"
  },
  dialog: {
    width: "95%"
  },
  paper: {
    width: "70%",
    marginTop: "10px"
  },
  dialogContent: {
    width: "500px"
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
};

const getWorkflowItem = (workflowItems, showWorkflowDetails, showDetailsItemId) => {
  let workflowItem = {
    key: "",
    data: []
  };

  if (showWorkflowDetails) {
    workflowItem = workflowItems.find(workflow => workflow.id === showDetailsItemId);
  }

  return workflowItem;
};
const removeNewLines = text => {
  let formattedText = "";
  if (!_.isEmpty(text)) {
    formattedText = text.replace(/\n/g, " ");
  }
  return formattedText;
};

const WorkflowDetails = ({
  workflowItems,
  subProjectDetails,
  showWorkflowDetails,
  showDetailsItemId,
  hideWorkflowDetails,
  users,
  validateDocument,
  validatedDocuments
}) => {
  const actions = [<Button onClick={hideWorkflowDetails}>{strings.common.close}</Button>];

  const workflowItem = getWorkflowItem(workflowItems, showWorkflowDetails, showDetailsItemId);
  const status = workflowItem.status;
  const trimmedComment = removeNewLines(workflowItem.description);

  console.log(toAmountString(workflowItem.amount, workflowItem.currency));
  return (
    <Dialog autoScrollBodyContent={true} open={showWorkflowDetails} modal={false} style={styles.dialog}>
      <DialogTitle>{workflowItem.displayName}</DialogTitle>
      <DialogContent style={styles.dialogContent}>
        <div style={styles.row}>
          <Typography variant="subheading">{strings.common.budget}:</Typography>
          <TextField
            id={strings.common.budget}
            disabled={true}
            label={toAmountString(workflowItem.amount, workflowItem.currency)}
            helperText={" "}
            style={styles.textfield}
            underlineShow={false}
          />
        </div>
        <Divider />
        <div style={styles.row}>
          <Typography variant="subheading">{strings.common.comment}:</Typography>
          <TextField
            id={strings.common.comment}
            disabled={true}
            multiline={true}
            label={trimmedComment}
            helperText={" "}
            style={styles.textfield}
            underlineShow={false}
          />
        </div>
        <Divider />
        <div style={styles.row}>
          <Typography variant="subheading"> {strings.workflow.workflow_documents}:</Typography>

          <DocumentOverview
            id={strings.workflow.workflow_documents}
            documents={workflowItem.documents}
            validateDocument={validateDocument}
            validatedDocuments={validatedDocuments}
          />
        </div>
        <Divider />
        <div style={styles.row}>
          <Typography variant="subheading">{strings.common.status}:</Typography>
          <TextField
            id={strings.common.comment}
            disabled={true}
            label={statusMapping(status)}
            helperText={" "}
            style={styles.textfield}
            underlineShow={false}
          />
        </div>

        <Divider />
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};

export default WorkflowDetails;
