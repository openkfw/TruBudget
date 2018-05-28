import React from "react";

import AmountIcon from "@material-ui/icons/AccountBalance";
import AssigneeIcon from "@material-ui/icons/Group";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import _isEmpty from "lodash/isEmpty";

import { toAmountString, statusMapping, statusIconMapping } from "../../helper";
import DocumentOverview from "../Documents/DocumentOverview";
import strings from "../../localizeStrings";

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
    workflowItem = workflowItems.find(workflow => workflow.data.id === showDetailsItemId);
  }

  return workflowItem;
};
const removeNewLines = text => {
  let formattedText = "";
  if (!_isEmpty(text)) {
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
  const { displayName, description, amountType, status, assignee, amount, currency } = workflowItem.data;
  const trimmedComment = removeNewLines(description);
  const assignedUser = users.find(user => user.id === assignee);
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
              primary={amountType !== "N/A" ? toAmountString(amount, currency) : "N/A"}
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
            <ListItemText primary={assignedUser ? assignedUser.displayName : ""} secondary={strings.common.assignee} />
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
