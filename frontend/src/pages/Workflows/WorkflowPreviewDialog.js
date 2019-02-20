import React from "react";

import Card from "@material-ui/core/Card";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import { withStyles } from "@material-ui/core";
import _isEmpty from "lodash/isEmpty";
import ErrorIcon from "@material-ui/icons/Close";
import DoneIcon from "@material-ui/icons/Done";

import strings from "../../localizeStrings";

import PreviewDialog from "../Common/PreviewDialog";

const styles = {
  headerCell: {
    fontSize: "14px",
    alignSelf: "center",
    flex: "1",
    padding: "0px 0px 0px 8px"
  },
  transactionMessages: {
    fontSize: "14px",
    borderBottom: "unset",
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

const getTableEntries = (props, cardRef) => {
  const { workflowActions, submittedWorkflowItems, classes } = props;
  const possibleActions = workflowActions.possible;
  const notPossibleActions = workflowActions.notPossible;
  let table = [];

  if (!_isEmpty(notPossibleActions)) {
    table = addHeader(table, "Not possible actions", classes);
    table = addActions(table, notPossibleActions, classes, undefined, cardRef);
  }
  if (!_isEmpty(possibleActions)) {
    table = addHeader(table, "Possible actions", classes);
    table = addActions(table, possibleActions, classes, submittedWorkflowItems, cardRef);
  }
  return table;
};

function addActions(table, actions, classes, submittedWorkflowItems, cardRef) {
  actions.forEach((action, index) => {
    table.push(
      <TableRow
        className={classes.flexbox}
        style={{ height: "30px", borderBottom: "unset" }}
        key={index + "-" + action.displayName + "-" + action.action + "-" + action.identity}
      >
        <TableCell className={classes.transactionMessages} style={{ flex: 6 }}>
          {action.displayName}:
        </TableCell>
        <TableCell className={classes.transactionMessages} style={{ flex: 12 }}>
          {action.action}&nbsp;
          {action.intent}&nbsp;
          {action.assignee || action.identity}
        </TableCell>
        <TableCell className={classes.transactionMessages} style={{ flex: 1, textAlign: "right" }}>
          {getStatusIcon(submittedWorkflowItems, action, cardRef)}
        </TableCell>
      </TableRow>
    );
  });
  return table;
}
function getStatusIcon(submittedWorkflowItems, action, cardRef) {
  if (submittedWorkflowItems === undefined) {
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
      //cardRef.scroll(0, 40);
      return <DoneIcon />;
    } else {
      return "-";
    }
  }
}

function addHeader(table, headline, classes) {
  table.push(
    <React.Fragment key={headline + "-div"}>
      <TableRow style={{ display: "flex" }} key={headline}>
        <TableCell style={{ fontSize: "16px", alignSelf: "center", flex: 1 }}>{headline}</TableCell>
      </TableRow>
      <TableRow style={{ display: "flex" }} className={classes.rowHeight} key={headline + "-columns"}>
        <TableCell className={classes.headerCell} style={{ flex: 6 }}>
          Workflowitem
        </TableCell>
        <TableCell className={classes.headerCell} style={{ flex: 12 }}>
          Action
        </TableCell>
        <TableCell className={classes.headerCell} style={{ flex: 1, textAlign: "right" }}>
          Status
        </TableCell>
      </TableRow>
    </React.Fragment>
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
    submittedWorkflowItems,
    ...rest
  } = props;

  const handleDone = () => {
    hideWorkflowItemPreview();
    disableWorkflowEdit();
  };

  class Preview extends React.Component {
    constructor(props) {
      super(props);
      this.cardRef = null;
    }

    render() {
      return (
        <Card
          ref={ref => (this.cardRef = ref)}
          style={{
            overflowY: "scroll"
          }}
        >
          <Table data-test="ssp-table">
            <TableBody className={classes.flexboxColumn}>{getTableEntries(props, this.cardRef)}</TableBody>
          </Table>
        </Card>
      );
    }
  }

  const onCancel = () => {
    hideWorkflowItemPreview();
    resetSucceededWorkflowitems();
  };
  const preview = <Preview {...props} />;

  return (
    <PreviewDialog
      title={strings.workflow.workflow_title}
      dialogShown={previewDialogShown}
      onDialogCancel={() => onCancel()}
      onDialogSubmit={() => editWorkflowitems(projectId, subProjectId, workflowActions.possible)}
      preview={preview}
      onDialogDone={handleDone}
      submitDone={submitDone}
      nItemsToSubmit={!_isEmpty(workflowActions.possible) ? workflowActions.possible.length : 0}
      nSubmittedItems={!_isEmpty(submittedWorkflowItems) ? submittedWorkflowItems.length : 0}
      {...rest}
    />
  );
};

export default withStyles(styles)(WorkflowPreviewDialog);
