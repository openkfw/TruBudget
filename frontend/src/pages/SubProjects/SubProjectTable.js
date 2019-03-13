import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
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
import LaunchIcon from "@material-ui/icons/ZoomIn";
import MoreIcon from "@material-ui/icons/MoreHoriz";

import { toAmountString, statusMapping } from "../../helper";
import strings from "../../localizeStrings";
import { canViewSubProjectDetails, canEditSubProject, canViewSubProjectPermissions } from "../../permissions";
import _isEmpty from "lodash/isEmpty";

const styles = {
  tableText: {
    fontSize: "14px"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center"
  },
  button: {
    width: "33%"
  },
  budgetContainer: {
    display: "flex",
    flexWrap: "wrap"
  },
  budget: {
    margin: "4px"
  }
};

const displaySubprojectBudget = budgets => {
  const consolidatedBudgets = budgets.reduce((acc, next) => {
    acc[next.currencyCode] = acc[next.currencyCode] ? [...acc[next.currencyCode], next] : [next];
    return acc;
  }, {});

  let display = [];
  for (const currencyCode in consolidatedBudgets) {
    const numberOfBudgets = consolidatedBudgets[currencyCode].length;
    display.push(
      <div key={`projectedBudget-sp-${currencyCode}`} style={styles.budget}>
        <Tooltip
          title={
            <div>
              {consolidatedBudgets[currencyCode].map((b, i) => (
                <div key={`tt-pb-sp-${i}`}>{`${b.organization}: ${toAmountString(b.value, currencyCode)}`}</div>
              ))}
            </div>
          }
        >
          <Chip
            avatar={
              <Avatar>
                {numberOfBudgets === 1 ? consolidatedBudgets[currencyCode][0].organization.slice(0, 1) : <MoreIcon />}
              </Avatar>
            }
            label={toAmountString(
              consolidatedBudgets[currencyCode].reduce((acc, next) => acc + parseFloat(next.value), 0),
              currencyCode
            )}
          />
        </Tooltip>
      </div>
    );
  }

  return <div style={styles.budgetContainer}>{display}</div>;
};

const getTableEntries = (
  classes,
  subProjects,
  location,
  history,
  showEditDialog,
  showSubProjectPermissions,
  showSubProjectAdditionalData
) => {
  return subProjects.map(({ data, allowedIntents }, index) => {
    const { currency, status, description, displayName, id, projectedBudgets } = data;
    const isOpen = status !== "closed";
    const editDisabled = !(canEditSubProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewSubProjectPermissions(allowedIntents);
    const redacted = displayName === null && _isEmpty(projectedBudgets);

    if (!redacted) {
      const amountString = displaySubprojectBudget(projectedBudgets);
      return (
        <TableRow key={index}>
          <TableCell className={classes.tableText}>{displayName}</TableCell>
          <TableCell className={classes.tableText}>{amountString}</TableCell>
          <TableCell className={classes.tableText}>{statusMapping(status)}</TableCell>
          <TableCell>
            <div className={classes.buttonContainer}>
              <div className={classes.button}>
                <Tooltip id="tooltip-additionalData" title="Additional Data">
                  <div>
                    <IconButton
                      data-test={`adata-button-${index}`}
                      onClick={() => {
                        showSubProjectAdditionalData(id);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              </div>
              <div className={classes.button}>
                {isOpen && !editDisabled ? (
                  <Tooltip id="tooltip-pedit" title={strings.common.edit}>
                    <div>
                      <IconButton
                        disabled={editDisabled}
                        onClick={() => showEditDialog(id, displayName, description, currency, projectedBudgets)}
                      >
                        <EditIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                ) : null}
              </div>
              <div className={classes.button}>
                {canViewPermissions ? (
                  <Tooltip id="tooltip-ppermissions" title={strings.common.show_permissions}>
                    <div>
                      <IconButton
                        data-test={"spp-button-" + index}
                        disabled={!canViewPermissions}
                        onClick={() => showSubProjectPermissions(id)}
                        variant="contained"
                      >
                        <PermissionIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                ) : null}
              </div>
              <div className={classes.button}>
                {canViewSubProjectDetails(allowedIntents) ? (
                  <Tooltip id="tooltip-inspect" title={strings.common.view}>
                    <div>
                      <IconButton
                        disabled={!canViewSubProjectDetails(allowedIntents)}
                        onClick={() => history.push("/projects/" + location.pathname.split("/")[2] + "/" + id)}
                      >
                        <LaunchIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                ) : null}
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }
    return null;
  });
};

const SubProjectTable = ({
  classes,
  subProjects,
  history,
  location,
  showEditDialog,
  showSubProjectPermissions,
  showSubProjectAdditionalData,
  isSubProjectAdditionalDataShown
}) => {
  const tableEntries = getTableEntries(
    classes,
    subProjects,
    location,
    history,
    showEditDialog,
    showSubProjectPermissions,
    showSubProjectAdditionalData,
    isSubProjectAdditionalDataShown
  );
  return (
    <Card>
      <CardHeader title={strings.common.subprojects} />
      <Table data-test="ssp-table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.tableText}>{strings.common.subproject}</TableCell>
            <TableCell className={classes.tableText}>{strings.common.projectedBudget}</TableCell>
            <TableCell className={classes.tableText}>{strings.common.status}</TableCell>
            <TableCell className={classes.tableText}> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{tableEntries}</TableBody>
      </Table>
    </Card>
  );
};

export default withStyles(styles)(SubProjectTable);
