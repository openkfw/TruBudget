import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Chip from "@material-ui/core/Chip";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import EditIcon from "@material-ui/icons/Edit";
import PermissionIcon from "@material-ui/icons/LockOpen";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import LaunchIcon from "@material-ui/icons/ZoomIn";
import _isEmpty from "lodash/isEmpty";
import React from "react";

import { statusMapping, toAmountString } from "../../helper";
import strings from "../../localizeStrings";
import { canUpdateSubProject, canViewSubProjectDetails, canViewSubProjectPermissions } from "../../permissions";
import ActionButton from "../Common/ActionButton";

const styles = {
  subprojectTable: {
    tableLayout: "fixed"
  },
  tableText: {
    fontSize: "14px"
  },
  displayName: {
    fontSize: "14px",
    width: "40%",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  projectdBudget: {
    fontSize: "14px",
    width: "20%"
  },
  status: {
    fontSize: "14px",
    width: "20%"
  },
  actions: {
    fontSize: "14px",
    width: "20%"
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
    const { currency, status, description, displayName, id, projectedBudgets, additionalData } = data;
    const isOpen = status !== "closed";
    const editDisabled = !(canUpdateSubProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewSubProjectPermissions(allowedIntents);
    const redacted = displayName === null && _isEmpty(projectedBudgets);
    const additionalDataEmpty = _isEmpty(additionalData);

    if (!redacted) {
      const amountString = displaySubprojectBudget(projectedBudgets);
      return (
        <TableRow key={index}>
          <TableCell className={classes.displayName} data-test={`subproject-title-${index}`}>
            {displayName}
          </TableCell>
          <TableCell className={classes.projectdBudget}>{amountString}</TableCell>
          <TableCell className={classes.status}>{statusMapping(status)}</TableCell>
          <TableCell className={classes.actions}>
            <div className={classes.buttonContainer}>
              <div className={classes.button}>
                <ActionButton
                  notVisible={additionalDataEmpty}
                  onClick={() => {
                    showSubProjectAdditionalData(id);
                  }}
                  title="Additional Data"
                  icon={<MoreIcon />}
                  data-test={`subproject-additionaldata-${index}`}
                />
              </div>
              <div className={classes.button}>
                <ActionButton
                  notVisible={!isOpen || editDisabled}
                  onClick={() => showEditDialog(id, displayName, description, currency, projectedBudgets)}
                  title={strings.common.edit}
                  icon={<EditIcon />}
                  data-test={`subproject-edit-button-${index}`}
                />
              </div>
              <div className={classes.button}>
                <ActionButton
                  notVisible={!canViewPermissions}
                  onClick={() => showSubProjectPermissions(id)}
                  title={strings.common.show_permissions}
                  icon={<PermissionIcon />}
                  data-test={"spp-button-" + index}
                />
              </div>
              <div className={classes.button}>
                <ActionButton
                  notVisible={!canViewSubProjectDetails(allowedIntents)}
                  onClick={() => history.push("/projects/" + location.pathname.split("/")[2] + "/" + id)}
                  title={strings.common.view}
                  icon={<LaunchIcon />}
                  data-test={`subproject-view-details-${index}`}
                />
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
      <Table data-test="ssp-table" className={classes.subprojectTable}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.displayName}>{strings.common.subproject}</TableCell>
            <TableCell className={classes.projectdBudget}>{strings.common.projected_budget}</TableCell>
            <TableCell className={classes.status}>{strings.common.status}</TableCell>
            <TableCell className={classes.actions}> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{tableEntries}</TableBody>
      </Table>
    </Card>
  );
};

export default withStyles(styles)(SubProjectTable);
