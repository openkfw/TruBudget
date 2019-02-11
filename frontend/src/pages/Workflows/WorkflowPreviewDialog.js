import React from "react";

import Card from "@material-ui/core/Card";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withStyles } from "@material-ui/core";

import { toAmountString } from "../../helper";
import strings from "../../localizeStrings";

import PreviewDialog from "../Common/PreviewDialog";

const styles = {
  // cellFormat: {
  //   fontSize: "14px",
  //   paddingRight: "12px"
  // },
  // notUpdated: {
  //   color: "lightgrey"
  // },
  // rowHeight: {
  //   height: "56px"
  // }
};

const getTableEntries = (classes, worklflowItems, changes) => {
  return worklflowItems.map(({ data }, index) => {
    const { currency, amount, description, displayName } = data;
    const amountString = toAmountString(amount, currency);
    return (
      <TableRow key={index} className={classes.rowHeight}>
        {changes.displayName ? (
          <TableCell className={classes.cellFormat}>{changes.displayName}</TableCell>
        ) : (
          <TableCell style={{ ...styles.cellFormat, ...styles.notUpdated }}>{displayName}</TableCell>
        )}
        {changes.description ? (
          <TableCell className={classes.cellFormat}>{changes.description}</TableCell>
        ) : (
          <TableCell style={{ ...styles.cellFormat, ...styles.notUpdated }}>{description}</TableCell>
        )}
        {changes.currency ? (
          <TableCell className={classes.cellFormat}>{changes.currency}</TableCell>
        ) : (
          <TableCell style={{ ...styles.cellFormat, ...styles.notUpdated }}>{currency}</TableCell>
        )}
        {changes.amountString ? (
          <TableCell className={classes.cellFormat}>{changes.amountString}</TableCell>
        ) : (
          <TableCell style={{ ...styles.cellFormat, ...styles.notUpdated }}>{amountString}</TableCell>
        )}
      </TableRow>
    );
  });
};

const WorkflowPreviewDialog = props => {
  const { workflowItems, hideWorkflowItemPreview, previewDialogShown, editWorkflowitem, classes } = props;

  const editWorkflowitems = (editWorkflowitem, workflowitems) => {
    return;
  };

  const preview = (
    <Card>
      <Table data-test="ssp-table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.cellFormat}>{strings.subproject.subproject_title}</TableCell>
            <TableCell className={classes.cellFormat}>{strings.common.comment}</TableCell>
            <TableCell className={classes.cellFormat}>{strings.project.project_currency}</TableCell>
            <TableCell className={classes.cellFormat}>{strings.common.budget} </TableCell>
          </TableRow>
        </TableHead>
        {getTableEntries(classes, workflowItems, { currency: "EUR" })}
      </Table>
    </Card>
  );

  return (
    <div>
      <PreviewDialog
        title={strings.workflow.workflow_title}
        dialogShown={previewDialogShown}
        onDialogCancel={hideWorkflowItemPreview}
        onDialogSubmit={editWorkflowitems}
        preview={preview}
        {...props}
      />
    </div>
  );
};

export default withStyles(styles)(WorkflowPreviewDialog);
