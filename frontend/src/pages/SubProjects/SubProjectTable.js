import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import { withStyles, withTheme } from "@mui/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import PermissionIcon from "@mui/icons-material/LockOpen";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import LaunchIcon from "@mui/icons-material/ZoomIn";
import _isEmpty from "lodash/isEmpty";
import Highlighter from "react-highlight-words";
import React from "react";

import { statusMapping, toAmountString } from "../../helper";
import strings from "../../localizeStrings";
import {
  canUpdateSubProject,
  canViewSubProjectDetails,
  canViewSubProjectPermissions,
  canViewSubProjectSummary
} from "../../permissions";
import ActionButton from "../Common/ActionButton";
import SubProjectSearch from "./SubProjectSearch";
import SubProjectEmptyState from "./SubprojectEmptyState";

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
    width: "30%"
  },
  status: {
    fontSize: "14px",
    width: "15%"
  },
  actions: {
    fontSize: "14px",
    width: "25%"
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

const getTableEntries = ({
  classes,
  subProjects,
  location,
  history,
  showEditDialog,
  showSubProjectPermissions,
  showSubProjectAdditionalData,
  searchTermArray,
  theme,
  storeSubSearchTerm,
  storeSubSearchBarDisplayed,
  idsPermissionsUnassigned
}) => {
  return subProjects.map(({ data, allowedIntents }, index) => {
    const { currency, status, description, displayName, id, projectedBudgets, additionalData } = data;
    const isOpen = status !== "closed";
    const editDisabled = !(canUpdateSubProject(allowedIntents) && isOpen);
    const canViewPermissions = canViewSubProjectPermissions(allowedIntents);
    const redacted = displayName === null && _isEmpty(projectedBudgets);
    const visibleSubproject = canViewSubProjectSummary(allowedIntents);
    const additionalDataEmpty = _isEmpty(additionalData);

    if (!redacted && visibleSubproject) {
      const amountString = displaySubprojectBudget(projectedBudgets);
      return (
        <TableRow key={index} data-test={`subproject-${id}`}>
          <TableCell className={classes.displayName} data-test={`subproject-title-${index}`}>
            <Highlighter
              data-test="highlighted-displayname"
              highlightStyle={{ backgroundColor: theme.palette.primary.light }}
              searchWords={searchTermArray}
              textToHighlight={displayName}
            />
          </TableCell>
          <TableCell className={classes.projectdBudget}>{amountString}</TableCell>
          <TableCell className={classes.status}>
            <Highlighter
              highlightStyle={{ backgroundColor: theme.palette.primary.light }}
              searchWords={searchTermArray}
              textToHighlight={statusMapping(status)}
            />
          </TableCell>
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
                  onClick={() => showSubProjectPermissions(id, displayName)}
                  title={strings.common.show_permissions}
                  icon={<PermissionIcon />}
                  data-test={"spp-button-" + index}
                />
              </div>
              <div className={classes.button}>
                <ActionButton
                  notVisible={!canViewSubProjectDetails(allowedIntents)}
                  onClick={() => {
                    storeSubSearchTerm("");
                    history.push("/projects/" + location.pathname.split("/")[2] + "/" + id);
                  }}
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
  idsPermissionsUnassigned,
  classes,
  subProjects,
  history,
  location,
  showEditDialog,
  showSubProjectPermissions,
  showSubProjectAdditionalData,
  isSubProjectAdditionalDataShown,
  searchBarDisplayed,
  searchTerm,
  searchDisabled,
  storeSubSearchBarDisplayed,
  storeSubSearchTerm,
  searchTermArray,
  theme
}) => {
  const tableEntries = getTableEntries({
    classes,
    subProjects,
    location,
    history,
    showEditDialog,
    showSubProjectPermissions,
    showSubProjectAdditionalData,
    searchTermArray,
    theme,
    storeSubSearchTerm,
    storeSubSearchBarDisplayed,
    idsPermissionsUnassigned
  });
  return (
    <Card>
      <CardHeader title={strings.common.subprojects} />
      <SubProjectSearch
        searchBarDisplayed={searchBarDisplayed}
        searchTerm={searchTerm}
        searchDisabled={searchDisabled}
        storeSearchBarDisplayed={storeSubSearchBarDisplayed}
        storeSearchTerm={storeSubSearchTerm}
      />
      {subProjects.length > 0 ? (
        <Table data-test="ssp-table" className={classes.subprojectTable}>
          <TableHead>
            <TableRow data-test="subproject-row">
              <TableCell className={classes.displayName}>{strings.common.subproject}</TableCell>
              <TableCell className={classes.projectdBudget}>{strings.common.projected_budget}</TableCell>
              <TableCell className={classes.status}>{strings.common.status}</TableCell>
              <TableCell className={classes.actions}> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableEntries}</TableBody>
        </Table>
      ) : (
        <SubProjectEmptyState />
      )}
    </Card>
  );
};

export default withTheme(withStyles(styles)(SubProjectTable));
