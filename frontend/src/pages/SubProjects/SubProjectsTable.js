import React from "react";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withStyles } from "@material-ui/core";
import PermissionIcon from "@material-ui/icons/LockOpen";
import EditIcon from "@material-ui/icons/Edit";
import LaunchIcon from "@material-ui/icons/Launch";

import { toAmountString, statusMapping } from "../../helper";
import strings from "../../localizeStrings";
import { canViewSubProjectDetails, canEditSubProject, canViewSubProjectPermissions } from "../../permissions";

const styles = {
  tableText: {
    fontSize: "14px"
  }
};

const getTableEntries = (classes, subProjects, location, history, showEditDialog, showSubProjectPermissions) => {
  return subProjects.map(({ data, allowedIntents }, index) => {
    const { currency, status, amount, description, displayName, id } = data;
    const editDisabled = !(canEditSubProject(allowedIntents) && status != "closed");
    const canViewPermissions = canViewSubProjectPermissions(allowedIntents);
    const amountString = toAmountString(amount, currency);
    const redacted = displayName === null && amount === null;
    if (!redacted) {
      return (
        <TableRow key={index}>
          <TableCell className={classes.tableText}>{displayName}</TableCell>
          <TableCell className={classes.tableText}>{amountString}</TableCell>
          <TableCell className={classes.tableText}>{statusMapping(status)}</TableCell>
          <TableCell>
            <Tooltip id="tooltip-ppermissions" title="Set permissions">
              <div>
                <IconButton
                  data-test="spp-button"
                  disabled={!canViewPermissions}
                  onClick={() => showSubProjectPermissions(id)}
                  variant="contained"
                >
                  <PermissionIcon />
                </IconButton>
              </div>
            </Tooltip>
            <Tooltip id="tooltip-pedit" title="Edit Subproject">
              <div>
                <IconButton
                  disabled={editDisabled}
                  onClick={() => showEditDialog(id, displayName, description, parseFloat(amount), currency)}
                >
                  <EditIcon />
                </IconButton>
              </div>
            </Tooltip>
            <Tooltip id="tooltip-inspect" title="Show Subproject">
              <div>
                <IconButton
                  disabled={!canViewSubProjectDetails(allowedIntents)}
                  onClick={() => history.push("/projects/" + location.pathname.split("/")[2] + "/" + id)}
                >
                  <LaunchIcon />
                </IconButton>
              </div>
            </Tooltip>
          </TableCell>
        </TableRow>
      );
    }
  });
};

const SubProjectsTable = ({ classes, subProjects, history, location, showEditDialog, showSubProjectPermissions }) => {
  const tableEntries = getTableEntries(
    classes,
    subProjects,
    location,
    history,
    showEditDialog,
    showSubProjectPermissions
  );
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
