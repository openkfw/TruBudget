import React from "react";

import Card from "@material-ui/core/Card";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import { withStyles } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Close";
import DoneIcon from "@material-ui/icons/Done";
import LinearProgress from "@material-ui/core/LinearProgress";

import PreviewDialog from "../Common/PreviewDialog";

import _isEmpty from "lodash/isEmpty";
import strings from "../../localizeStrings";
import { formatString } from "../../helper";

const styles = {
  scrollable: {
    overflowY: "scroll"
  },
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
  }
};

const getTableEntries = props => {
  const { workflowActions, submittedWorkflowItems, failedWorkflowItem, classes } = props;
  const possibleActions = workflowActions.possible;
  const notPossibleActions = workflowActions.notPossible;
  let table = [];

  if (!_isEmpty(notPossibleActions)) {
    table = addHeader(table, strings.preview.not_possible_action, classes);
    table = addActions(table, notPossibleActions, classes, failedWorkflowItem);
  }
  if (!_isEmpty(possibleActions)) {
    table = addHeader(table, strings.preview.possible_action, classes);
    table = addActions(table, possibleActions, classes, failedWorkflowItem, submittedWorkflowItems);
  }
  return table;
};

function addHeader(table, headline, classes) {
  table.push(
    <React.Fragment key={headline}>
      <TableRow className={classes.headerRow} key={headline}>
        <TableCell className={classes.headerCell}>{headline}</TableCell>
      </TableRow>
      <TableRow className={classes.headerRow} key={headline + "-columns"}>
        <TableCell className={classes.columnHeaderCell} style={{ flex: 6 }}>
          {strings.common.workflowitem}
        </TableCell>
        <TableCell className={classes.columnHeaderCell} style={{ flex: 12 }}>
          {strings.common.action}
        </TableCell>
        <TableCell className={classes.columnHeaderCell} style={{ textAlign: "right" }}>
          {strings.common.status}
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
  return table;
}

function addActions(table, actions, classes, failedWorkflowItem, submittedWorkflowItems) {
  actions.forEach((action, index) => {
    table.push(
      <TableRow
        className={classes.workflowRow}
        key={index + "-" + action.displayName + "-" + action.action + "-" + action.identity}
      >
        <TableCell className={classes.workflowCell} style={{ flex: 6 }}>
          {action.displayName}:
        </TableCell>
        <TableCell className={classes.workflowCell} style={{ flex: 12 }}>
          {getActionText(action)}
        </TableCell>
        <TableCell className={classes.workflowCell} style={{ textAlign: "right" }}>
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
        item =>
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

const WorkflowPreviewDialog = props => {
  const {
    classes,
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
    <React.Fragment>
      <Card className={classes.scrollable}>
        <Table>
          <TableBody className={classes.tableBody}>{getTableEntries(props)}</TableBody>
        </Table>
      </Card>
      {submitInProgress ? <LinearProgress color="primary" /> : null}
    </React.Fragment>
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

export default withStyles(styles)(WorkflowPreviewDialog);
