import React from "react";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withStyles } from "@material-ui/core";

import { toAmountString, statusMapping } from "../../helper";
import strings from "../../localizeStrings";
import { canViewSubProjectDetails, canEditSubProject } from "../../permissions";

const styles = {
  tableText: {
    fontSize: "14px"
  }
};

const getTableEntries = (classes, subProjects, location, history, showEditDialog) => {
  return subProjects.map(({ data, allowedIntents }, index) => {
    const { currency, status, amount, description, displayName, id } = data;
    const editDisabled = !(canEditSubProject(allowedIntents) && status != "closed");

    const amountString = toAmountString(amount, currency);
    return (
      <TableRow key={index}>
        <TableCell className={classes.tableText}>{displayName}</TableCell>
        <TableCell className={classes.tableText}>{amountString}</TableCell>
        <TableCell className={classes.tableText}>{statusMapping(status)}</TableCell>
        <TableCell>
          <Button
            className={classes.tableText}
            disabled={editDisabled}
            onClick={() => showEditDialog(id, displayName, description, parseFloat(amount), currency)}
            color="secondary"
          >
            {strings.common.edit}
          </Button>
          <Button
            className={classes.tableText}
            disabled={!canViewSubProjectDetails(allowedIntents)}
            onClick={() => history.push("/projects/" + location.pathname.split("/")[2] + "/" + id)}
            color="secondary"
          >
            {strings.subproject.subproject_select_button}
          </Button>
        </TableCell>
      </TableRow>
    );
  });
};

const SubProjectsTable = ({ classes, subProjects, history, location, showEditDialog }) => {
  const tableEntries = getTableEntries(classes, subProjects, location, history, showEditDialog);
  return (
    <Card>
      <CardHeader title={strings.common.subprojects} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className={classes.tableText}>{strings.common.subproject}</TableCell>
            <TableCell className={classes.tableText}>{strings.common.budget}</TableCell>
            <TableCell className={classes.tableText}>{strings.common.status}</TableCell>
            <TableCell className={classes.tableText}> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{tableEntries}</TableBody>
      </Table>
    </Card>
  );
};

export default withStyles(styles)(SubProjectsTable);
