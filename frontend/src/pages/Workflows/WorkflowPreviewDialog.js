import React from "react";

import Card from "@material-ui/core/Card";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import { withStyles } from "@material-ui/core";
import _isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";

import PreviewDialog from "../Common/PreviewDialog";

const styles = {
  cellFormat: {
    fontSize: "14px",
    alignSelf: "center",
    textAlign: "center",
    flex: "0 0 150px",
    padding: "0px 0px 0px 8px"
  },
  transactionMessages: {
    fontSize: "14px",
    borderRight: "1px solid rgba(224, 224, 224, 1)",
    borderBottom: "unset",
    flex: "0 0 150px",
    padding: "0px 0px 0px 8px"
  },
  notUpdated: {
    color: "lightgrey"
  },
  rowHeight: {
    height: "40px"
  },
  flexbox: {
    display: "flex"
  },
  failed: {
    textDecorationLine: "line-through",
    backgroundColor: "red"
  },
  succeed: {
    display: "flex",
    backgroundColor: "green"
  },
  flexboxColumn: {
    display: "flex",
    flexDirection: "column"
  }
};

const getTableEntries = props => {
  const { workflowActions, classes } = props;
  const possibleActions = workflowActions.possible;
  const notPossibleActions = workflowActions.notPossible;
  let table = [];

  table = addHeader(table, "Possible actions", classes);

  possibleActions.forEach(action => {
    table.push(
      <TableRow className={classes.flexbox} style={{ height: "unset", borderBottom: "unset" }}>
        <TableCell className={classes.transactionMessages}>{action.displayName}</TableCell>
        <TableCell className={classes.transactionMessages}>{action.action}</TableCell>
        <TableCell className={classes.transactionMessages}> {action.intent}</TableCell>
        <TableCell className={classes.transactionMessages}>{action.assignee || action.identity}</TableCell>
      </TableRow>
    );
  });
  table = addHeader(table, "Not possible actions", classes);

  notPossibleActions.forEach(action => {
    table.push(
      <TableRow className={classes.flexbox} style={{ height: "unset", borderBottom: "unset" }}>
        <TableCell className={classes.transactionMessages}>{action.displayName}</TableCell>
        <TableCell className={classes.transactionMessages}>{action.action}</TableCell>
        <TableCell className={classes.transactionMessages}> {action.intent}</TableCell>
        <TableCell className={classes.transactionMessages}>{action.assignee || action.identity}</TableCell>
      </TableRow>
    );
  });

  return table;
};

function addHeader(table, headline, classes) {
  table.push(
    <div>
      <TableRow style={{ display: "flex" }}>
        <TableCell style={{ fontSize: "16px", alignSelf: "center", flex: "1", textAlign: "center" }}>
          {headline}
        </TableCell>
      </TableRow>
      <TableRow style={{ display: "flex" }} className={classes.rowHeight}>
        <TableCell className={classes.cellFormat}>Name</TableCell>
        <TableCell className={classes.cellFormat}>Action</TableCell>
        <TableCell className={classes.cellFormat}>Intent</TableCell>
        <TableCell className={classes.cellFormat}>Identity</TableCell>
      </TableRow>
    </div>
  );
  return table;
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
    ...rest
  } = props;

  const handleDone = () => {
    hideWorkflowItemPreview();
    disableWorkflowEdit();
  };

  const preview = (
    <Card>
      <Table data-test="ssp-table">
        <TableBody className={classes.flexboxColumn}>
          {_isEmpty(workflowActions) ? "no actions to submit" : getTableEntries(props)}
        </TableBody>
      </Table>
    </Card>
  );

  const onCancel = () => {
    hideWorkflowItemPreview();
    resetSucceededWorkflowitems();
  };

  return (
    <div>
      <PreviewDialog
        title={strings.workflow.workflow_title}
        dialogShown={previewDialogShown}
        onDialogCancel={() => onCancel()}
        onDialogSubmit={() => editWorkflowitems(projectId, subProjectId, workflowActions.possible)}
        preview={preview}
        disableCancelButton={_isEmpty(workflowActions)}
        submitButtonText={_isEmpty(workflowActions) ? strings.common.done : strings.common.submit}
        onDialogDone={handleDone}
        submitDone={submitDone}
        {...rest}
      />
    </div>
  );
};

export default withStyles(styles)(WorkflowPreviewDialog);
