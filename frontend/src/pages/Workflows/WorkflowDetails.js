import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import _isEmpty from "lodash/isEmpty";

import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import AmountIcon from "@mui/icons-material/AccountBalance";
import AssigneeIcon from "@mui/icons-material/Group";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import { isDateReached, statusIconMapping, statusMapping, toAmountString } from "../../helper";
import strings from "../../localizeStrings";
import DocumentOverviewContainer from "../Documents/DocumentOverviewContainer";

import WorkflowitemHistoryTab from "./WorkflowitemHistoryTab/WorkflowHistoryTab";

const styles = {
  alert: {
    border: (theme) => `3px solid ${theme.palette.warning.main}`,
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

const removeNewLines = (text) => {
  let formattedText = "";
  if (!_isEmpty(text)) {
    formattedText = text.replace(/\n/g, " ");
  }
  return formattedText;
};

const Overview = ({ users, workflowitem }) => {
  const { displayName, description, amountType, assignee, amount, currency, dueDate, workflowitemType, rejectReason } =
    { ...workflowitem?.data };
  const status = rejectReason ? "rejected" : workflowitem.data.status;
  const trimmedComment = removeNewLines(description);
  const assignedUser = users.find((user) => user.id === assignee);

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
          style={styles.displayName}
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
            <Avatar sx={isDateReached(dueDate) && status === "open" ? styles.alert : null} data-test="due-date">
              <AccessAlarmIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={dayjs(dueDate).format(strings.format.dateFormat)}
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
        <ListItemText primary={assignedUser ? assignedUser.displayName : ""} secondary={strings.workflow.assignee} />
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
};

const Documents = ({
  documents,
  validateDocument,
  validatedDocuments,
  _showWorkflowDetails,
  projectId,
  subprojectId,
  workflowitemId,
  workflowitemStatus
}) => {
  return (
    <DocumentOverviewContainer
      id={strings.workflow.workflow_documents}
      documents={documents}
      validateDocument={validateDocument}
      validatedDocuments={validatedDocuments}
      projectId={projectId}
      subprojectId={subprojectId}
      workflowitemId={workflowitemId}
      workflowitemStatus={workflowitemStatus}
    />
  );
};

const WorkflowDetails = ({
  workflowitem,
  showWorkflowDetails,
  hideWorkflowDetails,
  closeWorkflowitemDetailsDialog,
  users,
  validateDocument,
  validatedDocuments,
  projectId,
  subProjectId: subprojectId,
  worflowDetailsInitialTab
}) => {
  const [selectedTab, setSelectedTab] = useState(worflowDetailsInitialTab);
  useEffect(() => {
    if (!showWorkflowDetails) {
      setSelectedTab(0);
    }
  }, [showWorkflowDetails]);

  if (workflowitem.data === undefined) {
    return <></>;
  }

  let content;

  if (selectedTab === 0) {
    content = <Overview {...{ users, workflowitem }} />;
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
          workflowitemId: workflowitem.data.id,
          workflowitemStatus: workflowitem.data.status
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
    <Dialog
      open={showWorkflowDetails}
      style={styles.dialog}
      TransitionProps={{
        onExited: closeWorkflowitemDetailsDialog
      }}
    >
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
        <Button data-test="workflowdetails-close" onClick={hideWorkflowDetails}>
          {strings.common.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowDetails;
