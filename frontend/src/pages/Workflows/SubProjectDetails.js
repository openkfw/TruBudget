import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import AmountIcon from "@material-ui/icons/AccountBalance";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import DoneIcon from "@material-ui/icons/Check";
import DateIcon from "@material-ui/icons/DateRange";
import AssigneeIcon from "@material-ui/icons/Group";
import BarChartIcon from "@material-ui/icons/BarChart";
import _isUndefined from "lodash/isUndefined";
import React from "react";

import { statusIconMapping, statusMapping, toAmountString, unixTsToString } from "../../helper.js";
import strings from "../../localizeStrings";
import SubProjectAssigneeContainer from "./SubProjectAssigneeContainer";
import SubProjectAnalyticsDialog from "../Analytics/SubProjectAnalyticsDialog";

const styles = {
  container: {
    display: "flex",
    height: "30%",
    flex: 1,
    flexDirection: "row",
    width: "100%",
    marginBottom: "24px",
    justifyContent: "space-between"
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
    paddingTop: "18px"
  },
  analytics: {
    padding: "12px 0 "
  }
};

const subProjectCanBeClosed = (subProjectIsClosed, userIsAllowedToClose, workflowItems) =>
  !subProjectIsClosed && userIsAllowedToClose && _isUndefined(workflowItems.find(i => i.data.status !== "closed"));

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
  id,
  status,
  roles,
  assignee,
  workflowItems,
  created,
  budgetEditEnabled,
  canViewPermissions,
  canAssignSubproject,
  parentProject,
  users,
  showSubProjectAssignee,
  closeSubproject,
  canCloseSubproject,
  openAnalyticsDialog,
  ...props
}) => {
  const mappedStatus = statusMapping(status);
  const statusIcon = statusIconMapping[status];
  const date = unixTsToString(created);

  const closingOfSubProjectAllowed = subProjectCanBeClosed(status === "closed", canCloseSubproject, workflowItems);
  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <List>
          <ListItem>
            {displayName ? <Avatar>{displayName[0]}</Avatar> : null}
            <ListItemText primary={displayName} secondary={description} />
          </ListItem>
          <ListItem>
            <Avatar>
              <DateIcon />
            </Avatar>
            <ListItemText primary={date} secondary={strings.common.created} />
          </ListItem>
          <ListItem>
            <Avatar>
              <AmountIcon />
            </Avatar>
            <ListItemText primary={currency} secondary="Subproject currency" />
          </ListItem>
        </List>
        <div style={styles.projectedBudget}>
          <Typography variant="body1">{strings.common.projectedBudget}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{strings.users.organization}</TableCell>
                <TableCell align="right">{strings.common.amount}</TableCell>
                <TableCell align="right">{strings.common.currency}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.projectedBudgets.map(budget => (
                <TableRow key={budget.organization + budget.currencyCode}>
                  <TableCell>{budget.organization}</TableCell>
                  <TableCell align="right">{toAmountString(budget.value)}</TableCell>
                  <TableCell align="right">{budget.currencyCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div style={styles.analytics}>
            <Button variant="outlined" color="primary" onClick={openAnalyticsDialog}>
              <BarChartIcon />
              {strings.project.project_details}
            </Button>
          </div>
        </div>
        <List>
          <ListItem>
            <Avatar>{statusIcon}</Avatar>
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
            <Avatar>
              <AssigneeIcon />
            </Avatar>
            <ListItemText
              primary={
                <SubProjectAssigneeContainer
                  projectId={parentProject ? parentProject.id : ""}
                  subprojectId={id}
                  users={users}
                  disabled={!canAssignSubproject}
                  assignee={assignee}
                />
              }
              secondary={strings.common.assignee}
            />
          </ListItem>
        </List>
      </Card>
      <SubProjectAnalyticsDialog projectId={parentProject.id} subProjectId={id} />
    </div>
  );
};
export default SubProjectDetails;
