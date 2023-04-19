import React from "react";
import _isEmpty from "lodash/isEmpty";

import ErrorIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { formatString } from "../../helper";
import strings from "../../localizeStrings";
import PreviewDialog from "../Common/PreviewDialog";

const styles = {
  tableBody: {
    display: "flex",
    flexDirection: "column"
  },
  headerRow: {
    display: "flex",
    height: "40px"
  },
  headerCell: {
    fontSize: "16px",
    alignSelf: "center",
    textAlign: "center",
    flex: "1",
    borderBottom: "unset"
  },
  columnHeaderCell: {
    fontSize: "14px",
    alignSelf: "center",
    flex: "1",
    padding: "0px 0px 0px 8px"
  },
  workflowRow: {
    display: "flex",
    height: "30px",
    borderBottom: "unset"
  },
  workflowCell: {
    fontSize: "14px",
    borderBottom: "unset",
    padding: "0px 0px 0px 8px",
    flex: 1
  },
  infoContainer: {
    margin: "0px 36px 10px 36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "500px"
  }
};

const getTableEntries = (props) => {
  const { workflowActions, submittedWorkflowItems, failedWorkflowItem } = props;
  const possibleActions = workflowActions.possible;
  const notPossibleActions = workflowActions.notPossible;
  let table = [];

  if (!_isEmpty(notPossibleActions)) {
    table = addHeader(table, strings.preview.not_possible_action);
    table = addActions(table, notPossibleActions, failedWorkflowItem);
  }
  if (!_isEmpty(possibleActions)) {
    table = addHeader(table, strings.preview.possible_action);
    table = addActions(table, possibleActions, failedWorkflowItem, submittedWorkflowItems);
  }
  return table;
};

function addHeader(table, headline) {
  table.push(
    <React.Fragment key={headline}>
      <TableRow style={styles.headerRow} key={headline}>
        <TableCell style={styles.headerCell}>{headline}</TableCell>
      </TableRow>
      <TableRow style={styles.headerRow} key={headline + "-columns"}>
        <TableCell style={{ ...styles.columnHeaderCell, flex: 6 }}>{strings.common.workflowitem}</TableCell>
        <TableCell style={{ ...styles.columnHeaderCell, flex: 12 }}>{strings.common.action}</TableCell>
        <TableCell style={{ ...styles.columnHeaderCell, textAlign: "right" }}>{strings.common.status}</TableCell>
      </TableRow>
    </React.Fragment>
  );
  return table;
}

function addActions(table, actions, failedWorkflowItem, submittedWorkflowItems) {
  actions.forEach((action, index) => {
    table.push(
      <TableRow
        style={styles.workflowRow}
        key={index + "-" + action.displayName + "-" + action.action + "-" + action.identity}
      >
        <TableCell style={{ ...styles.workflowCell, flex: 6 }}>{action.displayName}:</TableCell>
        <TableCell style={{ ...styles.workflowCell, flex: 12 }}>{getActionText(action)}</TableCell>
        <TableCell style={{ ...styles.workflowCell, textAlign: "right" }}>
          {getStatusIcon(submittedWorkflowItems, failedWorkflowItem, action)}
        </TableCell>
      </TableRow>
    );
  });
  return table;
}

function getActionText(action) {
  let actionText = "";
  switch (action.action) {
    case strings.common.assign:
      actionText = formatString(strings.preview.assign_action_text, action.assignee);
      break;
    case strings.common.grant:
      actionText = formatString(strings.preview.grant_permission_action_text, action.intent, action.identity);
      break;
    case strings.common.revoke:
      actionText = formatString(strings.preview.revoke_permission_action_text, action.intent, action.identity);
      break;
    default:
      break;
  }
  return actionText;
}

function getStatusIcon(submittedWorkflowItems, failedWorkflowItem, action) {
  if (
    submittedWorkflowItems === undefined ||
    (action.id === failedWorkflowItem.id &&
      action.assignee === failedWorkflowItem.assignee &&
      action.identity === failedWorkflowItem.identity &&
      action.intent === failedWorkflowItem.intent)
  ) {
    return <ErrorIcon />;
  } else {
    if (
      submittedWorkflowItems.some(
        (item) =>
          action.id === item.id &&
          action.assignee === item.assignee &&
          action.identity === item.identity &&
          action.intent === item.intent
      )
    ) {
      return <DoneIcon />;
    } else {
      return "-";
    }
  }
}

const WorkflowPreviewDialog = (props) => {
  const {
    previewDialogShown,
    hideWorkflowItemPreview,
    resetSucceededWorkflowitems,
    workflowActions,
    editWorkflowitems,
    projectId,
    subProjectId,
    disableWorkflowEdit,
    submitDone,
    submittedWorkflowItems,
    submitInProgress,
    ...rest
  } = props;

  const handleDone = () => {
    hideWorkflowItemPreview();
    disableWorkflowEdit();
  };

  const preview = (
    <>
      <Typography style={styles.infoContainer} color="error" variant="subtitle1">
        {strings.preview.overwrite_warning}
      </Typography>
      <Box
        sx={{
          minWidth: "600px",
          overflowY: "scroll",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Table>
          <TableBody style={styles.tableBody}>{getTableEntries(props)}</TableBody>
        </Table>
      </Box>
      {submitInProgress ? <LinearProgress color="primary" /> : null}
    </>
  );

  const onCancel = () => {
    hideWorkflowItemPreview();
    resetSucceededWorkflowitems();
  };

  return (
    <PreviewDialog
      title={strings.preview.preview}
      dialogShown={previewDialogShown}
      onDialogCancel={() => onCancel()}
      onDialogSubmit={() => editWorkflowitems(projectId, subProjectId, workflowActions.possible)}
      preview={preview}
      onDialogDone={handleDone}
      submitDone={submitDone || _isEmpty(workflowActions.possible)}
      submitInProgress={submitInProgress}
      nItemsToSubmit={!_isEmpty(workflowActions.possible) ? workflowActions.possible.length : 0}
      nSubmittedItems={!_isEmpty(submittedWorkflowItems) ? submittedWorkflowItems.length : 0}
      {...rest}
    />
  );
};

export default WorkflowPreviewDialog;
