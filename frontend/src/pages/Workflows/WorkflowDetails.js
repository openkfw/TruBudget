import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import AmountIcon from "@material-ui/icons/AccountBalance";
import AssigneeIcon from "@material-ui/icons/Group";
import _isEmpty from "lodash/isEmpty";
import React, { useEffect, useState } from "react";

import { statusIconMapping, statusMapping, toAmountString } from "../../helper";
import strings from "../../localizeStrings";
import DocumentOverviewContainer from "../Documents/DocumentOverviewContainer";
import WorkflowitemHistoryTab from "./WorkflowitemHistoryTab/WorkflowHistoryTab";

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
  },
  displayName: {
    wordBreak: "break-word"
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

function Overview({ users, workflowitem }) {
  const { displayName, description, amountType, status, assignee, amount, currency } = workflowitem.data;
  const trimmedComment = removeNewLines(description);
  const assignedUser = users.find(user => user.id === assignee);
  return (
    <List>
      <ListItem>
        <Avatar>{displayName ? displayName[0] : "?"}</Avatar>
        <ListItemText
          data-test="workflowitemInfoDisplayName"
          primary={displayName}
          secondary={trimmedComment}
          style={styles.displayName}
        />
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
    </List>
  );
}

function Documents({ documents, validateDocument, validatedDocuments, showWorkflowDetails }) {
  return (
    <DocumentOverviewContainer
      id={strings.workflow.workflow_documents}
      documents={documents}
      validateDocument={validateDocument}
      validatedDocuments={validatedDocuments}
      validationActive={showWorkflowDetails}
    />
  );
}

function WorkflowDetails({
  workflowItems,
  showWorkflowDetails,
  showDetailsItemId,
  hideWorkflowDetails,
  closeWorkflowitemDetailsDialog,
  users,
  validateDocument,
  validatedDocuments,
  projectId,
  subProjectId: subprojectId
}) {
  const [selectedTab, setSelectedTab] = useState(0);
  useEffect(
    () => {
      if (!showWorkflowDetails) {
        setSelectedTab(0);
      }
    },
    [showWorkflowDetails]
  );

  const workflowitem = getWorkflowItem(workflowItems, showWorkflowDetails, showDetailsItemId);

  let content;
  if (selectedTab === 0) {
    content = <Overview {...{ users, workflowitem }} />;
  } else if (selectedTab === 1) {
    content = (
      <Documents
        {...{ documents: workflowitem.data.documents, showWorkflowDetails, validateDocument, validatedDocuments }}
      />
    );
  } else if (selectedTab === 2) {
    content = (
      <WorkflowitemHistoryTab subprojectId={subprojectId} projectId={projectId} workflowitemId={workflowitem.data.id} />
    );
  } else {
    throw new Error(`bug: illegal tab index ${selectedTab}`);
  }

  return (
    <Dialog open={showWorkflowDetails} style={styles.dialog} onExited={closeWorkflowitemDetailsDialog}>
      <DialogTitle data-test="workflowInfoDialog">{strings.workflow.workflowitem_details}</DialogTitle>
      <DialogContent style={styles.dialogContent}>
        <Tabs value={selectedTab} onChange={(_, index) => setSelectedTab(index)}>
          <Tab data-test="workflowitem-overview-tab" label={strings.workflow.workflowitem_details_overview} />
          <Tab data-test="workflowitem-documents-tab" label={strings.workflow.workflowitem_details_documents} />
          <Tab data-test="workflowitem-history-tab" label={strings.workflow.workflowitem_details_history} />
        </Tabs>
        {content}
      </DialogContent>
      <DialogActions>
        <Button onClick={hideWorkflowDetails}>{strings.common.close}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default WorkflowDetails;
