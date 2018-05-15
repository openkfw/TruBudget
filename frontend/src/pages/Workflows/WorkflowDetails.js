import React from "react";
import Dialog, { DialogContent, DialogActions } from "material-ui/Dialog";
import Card, { CardHeader, CardMedia } from "material-ui/Card";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import AmountIcon from "@material-ui/icons/AccountBalance";
import AssigneeIcon from "@material-ui/icons/Group";

import Avatar from "material-ui/Avatar";

import Divider from "material-ui/Divider";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";
import _ from "lodash";
import { toAmountString, statusMapping, statusIconMapping } from "../../helper";
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
  const workflowItem = getWorkflowItem(workflowItems, showWorkflowDetails, showDetailsItemId);
  const status = workflowItem.status;
  const { displayName, description, amountType, assignee } = workflowItem;
  const trimmedComment = removeNewLines(description);

  return (
    <Dialog open={showWorkflowDetails} style={styles.dialog} onClose={hideWorkflowDetails}>
      <DialogTitle>{"Workflow details"}</DialogTitle>
      <DialogContent style={styles.dialogContent}>
        <List>
          <ListItem>
            <Avatar>{displayName ? displayName[0] : "?"}</Avatar>
            <ListItemText primary={displayName} secondary={trimmedComment} />
          </ListItem>
          <ListItem>
            <Avatar>
              <AmountIcon />
            </Avatar>
            <ListItemText
              primary={amountType !== "N/A" ? toAmountString(workflowItem.amount, workflowItem.currency) : "N/A"}
              secondary={strings.common.budget}
            />
          </ListItem>
          <ListItem>
            <Avatar>{statusIconMapping[status]}</Avatar>
            <ListItemText primary={statusMapping(status)} secondary={strings.common.status} />
          </ListItem>
          <ListItem>
            <Avatar>
              <AssigneeIcon />
            </Avatar>
            <ListItemText primary={assignee} secondary={strings.common.assignee} />
          </ListItem>
          <Divider />
          <ListItem>
            <DocumentOverview
              id={strings.workflow.workflow_documents}
              documents={workflowItem.documents}
              validateDocument={validateDocument}
              validatedDocuments={validatedDocuments}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={hideWorkflowDetails}>{strings.common.close}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowDetails;
