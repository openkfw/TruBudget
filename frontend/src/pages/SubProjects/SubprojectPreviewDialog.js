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
  cellFormat: {
    fontSize: "14px",
    paddingRight: "12px"
  },
  rowHeight: {
    height: "56px"
  }
};

const getTableEntries = (classes, subProjects, changes) => {
  return subProjects.map(({ data }, index) => {
    const { currency, amount, description, displayName } = data;
    const amountString = toAmountString(amount, currency);
    return (
      <TableRow key={index} className={classes.rowHeight}>
        <TableCell className={classes.cellFormat}>{displayName}</TableCell>
        <TableCell className={classes.cellFormat}>{description}</TableCell>
        <TableCell className={classes.cellFormat}>{currency}</TableCell>
        <TableCell className={classes.cellFormat}>{amountString}</TableCell>
      </TableRow>
    );
  });
};

const SubprojectPreviewDialog = props => {
  const { subProjects, previewDialogTitle, hidePreviewDialog, previewDialogShown, editSubProjects, classes } = props;

  const preview = (
    <Card>
      <Table data-test="ssp-table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.cellFormat}>{strings.subproject.subproject_title}</TableCell>
            <TableCell className={classes.cellFormat}>{strings.common.comment_description}</TableCell>
            <TableCell className={classes.cellFormat}>{strings.project.project_currency}</TableCell>
            <TableCell className={classes.cellFormat}>{strings.common.budget} </TableCell>
          </TableRow>
        </TableHead>
        {getTableEntries(classes, subProjects, {})}
      </Table>
    </Card>
  );

  return (
    <div>
      <PreviewDialog
        title={previewDialogTitle}
        dialogShown={previewDialogShown}
        onDialogCancel={hidePreviewDialog}
        onDialogSubmit={editSubProjects}
        preview={preview}
        {...props}
      />
    </div>
  );
};

export default withStyles(styles)(SubprojectPreviewDialog);
