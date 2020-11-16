import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import AmountIcon from "@material-ui/icons/AccountBalance";
import BarChartIcon from "@material-ui/icons/BarChart";
import DoneIcon from "@material-ui/icons/Check";
import DateIcon from "@material-ui/icons/DateRange";
import AssigneeIcon from "@material-ui/icons/Group";
import PersonIcon from "@material-ui/icons/Person";
import SettingsIcon from "@material-ui/icons/Settings";
import _isEmpty from "lodash/isEmpty";
import React from "react";

import { statusIconMapping, statusMapping, toAmountString, unixTsToString } from "../../helper.js";
import strings from "../../localizeStrings";
import SubProjectAnalyticsDialog from "../Analytics/SubProjectAnalyticsDialog";
import SubProjectAssigneeContainer from "./SubProjectAssigneeContainer";
import BudgetEmptyState from "../Common/BudgetEmptyState";

const styles = {
  container: {
    display: "flex",
    height: "30%",
    flex: 1,
    flexDirection: "row",
    width: "100%",
    marginBottom: "24px",
    justifyContent: "space-between",
    alignItems: "center"
  },
  card: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between"
  },
  projectedBudget: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "18px",
    width: "32%"
  },
  subprojectDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "18px",
    width: "31%",
    overflowWrap: "break-word"
  },
  subprojectAssignee: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "18px",
    width: "31%"
  },
  analytics: {
    padding: "12px 0 ",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  tableCell: {
    padding: "5px"
  }
};

const subProjectCanBeClosed = (subProjectIsClosed, userIsAllowedToClose, workflowItems) => {
  const hasOpenWorkflowitems = !_isEmpty(workflowItems.find(workflowItem => workflowItem.data.status === "open"));
  return !subProjectIsClosed && userIsAllowedToClose && !hasOpenWorkflowitems;
};

const subProjectCloseButtonTooltip = (userIsAllowedToClose, subProjectCanBeClosed) => {
  if (subProjectCanBeClosed) {
    return strings.common.close;
  } else if (!userIsAllowedToClose) {
    return strings.subproject.subproject_close_not_allowed;
  } else {
    return strings.subproject.subproject_close_info;
  }
};

const SubProjectDetails = ({
  displayName,
  description,
  currency,
  subprojectId,
  status,
  assignee,
  workflowItems,
  created,
  canAssignSubproject,
  projectId,
  users,
  closeSubproject,
  canCloseSubproject,
  isDataLoading,
  openAnalyticsDialog,
  projectedBudgets,
  subprojectValidator,
  fixedWorkflowitemType
}) => {
  const mappedStatus = statusMapping(status);
  const statusIcon = statusIconMapping[status];
  const date = unixTsToString(created);
  const validator = users.find(user => user.id === subprojectValidator);

  const closingOfSubProjectAllowed = subProjectCanBeClosed(status === "closed", canCloseSubproject, workflowItems);
  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <List style={styles.subprojectDetails}>
          <ListItem data-test="subproject-details-displayname">
            {displayName ? (
              <ListItemAvatar>
                <Avatar>{displayName[0]}</Avatar>
              </ListItemAvatar>
            ) : null}
            <ListItemText primary={displayName} secondary={description} />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <DateIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={date} secondary={strings.common.created} />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AmountIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={currency} secondary={strings.subproject.subproject_currency} />
          </ListItem>
          {!_isEmpty(fixedWorkflowitemType) ? (
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <SettingsIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={fixedWorkflowitemType} secondary={strings.workflow.workflowitem_type} />
            </ListItem>
          ) : null}
        </List>

        <div style={styles.projectedBudget} data-test="subproject-projected-budget">
          <Typography variant="body1">{strings.common.projected_budget}</Typography>
          {isDataLoading ? (
            <div />
          ) : projectedBudgets.length > 0 ? (
            <div>
              <Table padding="none">
                <TableHead>
                  <TableRow>
                    <TableCell style={styles.tableCell}>{strings.common.organization}</TableCell>
                    <TableCell style={styles.tableCell} align="right">
                      {strings.common.amount}
                    </TableCell>
                    <TableCell style={styles.tableCell} align="right">
                      {strings.common.currency}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectedBudgets.map(budget => (
                    <TableRow key={budget.organization + budget.currencyCode}>
                      <TableCell style={styles.tableCell}>{budget.organization}</TableCell>
                      <TableCell style={styles.tableCell} align="right">
                        {toAmountString(budget.value)}
                      </TableCell>
                      <TableCell style={styles.tableCell} align="right">
                        {budget.currencyCode}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div style={styles.analytics}>
                <Button
                  variant="outlined"
                  color="primary"
                  data-test="details-analytics-button"
                  onClick={openAnalyticsDialog}
                >
                  <BarChartIcon />
                  {strings.project.project_details}
                </Button>
              </div>
            </div>
          ) : (
            <BudgetEmptyState text={strings.common.no_budget_subproject} />
          )}
        </div>
        <List style={styles.subprojectAssignee}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>{statusIcon}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={mappedStatus} secondary={strings.common.status} />
            {status !== "closed" ? (
              <Tooltip
                id="tooltip-sclose"
                title={subProjectCloseButtonTooltip(canCloseSubproject, closingOfSubProjectAllowed)}
              >
                <div>
                  <IconButton
                    color="primary"
                    data-test="spc-button"
                    disabled={!closingOfSubProjectAllowed}
                    onClick={closeSubproject}
                  >
                    <DoneIcon />
                  </IconButton>
                </div>
              </Tooltip>
            ) : null}
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AssigneeIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <SubProjectAssigneeContainer
                  projectId={projectId}
                  subprojectId={subprojectId}
                  users={users}
                  disabled={!canAssignSubproject}
                  assignee={assignee}
                />
              }
              secondary={strings.common.assignee}
            />
          </ListItem>
          {!_isEmpty(validator) ? (
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={validator.displayName} secondary={strings.subproject.subproject_validator} />
            </ListItem>
          ) : null}
        </List>
      </Card>
      <SubProjectAnalyticsDialog
        projectId={projectId}
        subProjectId={subprojectId}
        projectedBudgets={projectedBudgets}
      />
    </div>
  );
};
export default SubProjectDetails;
