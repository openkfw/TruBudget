import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import AmountIcon from "@material-ui/icons/AccountBalance";
import AssigneeIcon from "@material-ui/icons/Group";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import { withStyles, withTheme } from "@material-ui/core/styles";
import _isEmpty from "lodash/isEmpty";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { dateFormat, isDateReached } from "../../helper";
import { statusIconMapping, statusMapping, toAmountString } from "../../helper";
import strings from "../../localizeStrings";
import DocumentOverviewContainer from "../Documents/DocumentOverviewContainer";
import WorkflowitemHistoryTab from "./WorkflowitemHistoryTab/WorkflowHistoryTab";

const styles = theme => {
  return {
    alert: {
      border: `3px solid ${theme.palette.warning.main}`,
      width: 37,
      height: 37
    },
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

function Overview({ classes, users, workflowitem }) {
  const {
    displayName,
    description,
    amountType,
    status,
    assignee,
    amount,
    currency,
    dueDate,
    workflowitemType
  } = workflowitem.data;
  const trimmedComment = removeNewLines(description);
  const assignedUser = users.find(user => user.id === assignee);

  return (
    <List>
      <ListItem>
        <ListItemAvatar>
          <Avatar>{displayName ? displayName[0] : "?"}</Avatar>
        </ListItemAvatar>
        <ListItemText
          data-test="workflowitemInfoDisplayName"
          primary={displayName}
          secondary={trimmedComment}
          className={classes.displayName}
        />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <AmountIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={amountType !== "N/A" ? toAmountString(amount, currency) : "N/A"}
          secondary={strings.common.budget}
        />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar>{statusIconMapping[status]}</Avatar>
        </ListItemAvatar>
        <ListItemText
          data-test={"workflowitem-status"}
          primary={statusMapping(status)}
          secondary={strings.common.status}
        />
      </ListItem>
      {dueDate ? (
        <ListItem>
          <ListItemAvatar>
            <Avatar className={isDateReached(dueDate) && status === "open" ? classes.alert : null} data-test="due-date">
              <AccessAlarmIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={dayjs(dueDate).format(dateFormat())}
            secondary={
              isDateReached(dueDate) && status === "open" ? strings.common.dueDate_exceeded : strings.common.dueDate
            }
          />
        </ListItem>
      ) : null}
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <AssigneeIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={assignedUser ? assignedUser.displayName : ""} secondary={strings.common.assignee} />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar>W</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={workflowitemType}
          secondary={strings.workflow.workflowitem_type}
          data-test="workflowitemInfoType"
        />
      </ListItem>
    </List>
  );
}

function Documents({
  documents,
  validateDocument,
  validatedDocuments,
  showWorkflowDetails,
  projectId,
  subprojectId,
  workflowitemId
}) {
  return (
    <DocumentOverviewContainer
      id={strings.workflow.workflow_documents}
      documents={documents}
      validateDocument={validateDocument}
      validatedDocuments={validatedDocuments}
      validationActive={showWorkflowDetails}
      projectId={projectId}
      subprojectId={subprojectId}
      workflowitemId={workflowitemId}
    />
  );
}

function WorkflowDetails({
  classes,
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
  useEffect(() => {
    if (!showWorkflowDetails) {
      setSelectedTab(0);
    }
  }, [showWorkflowDetails]);

  const workflowitem = getWorkflowItem(workflowItems, showWorkflowDetails, showDetailsItemId);

  let content;
  if (selectedTab === 0) {
    content = <Overview {...{ classes, users, workflowitem }} />;
  } else if (selectedTab === 1) {
    content = (
      <Documents
        {...{
          documents: workflowitem.data.documents,
          showWorkflowDetails,
          validateDocument,
          validatedDocuments,
          projectId,
          subprojectId,
          workflowitemId: workflowitem.data.id
        }}
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
    <Dialog open={showWorkflowDetails} className={classes.dialog} onExited={closeWorkflowitemDetailsDialog}>
      <DialogTitle data-test="workflowInfoDialog">{strings.workflow.workflowitem_details}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Tabs value={selectedTab} onChange={(_, index) => setSelectedTab(index)}>
          <Tab data-test="workflowitem-overview-tab" label={strings.workflow.workflowitem_details_overview} />
          <Tab data-test="workflowitem-documents-tab" label={strings.workflow.workflowitem_details_documents} />
          <Tab data-test="workflowitem-history-tab" label={strings.workflow.workflowitem_details_history} />
        </Tabs>
        {content}
      </DialogContent>
      <DialogActions>
        <Button data-test="workflowdetails-close" onClick={hideWorkflowDetails}>
          {strings.common.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default withTheme(withStyles(styles)(WorkflowDetails));
