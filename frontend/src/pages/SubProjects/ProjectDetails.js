import { Button, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import BarChartIcon from "@material-ui/icons/BarChart";
import DoneIcon from "@material-ui/icons/Check";
import DateIcon from "@material-ui/icons/DateRange";
import AssigneeIcon from "@material-ui/icons/Group";
import _isUndefined from "lodash/isUndefined";
import React from "react";

import { statusIconMapping, statusMapping, toAmountString, unixTsToString } from "../../helper.js";
import strings from "../../localizeStrings";
import ProjectAnalyticsDialog from "../Analytics/ProjectAnalyticsDialog";
import ProjectAssigneeContainer from "./ProjectAssigneeContainer";

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

const ProjectDetails = props => {
  const {
    projectName,
    projectId,
    subProjects,
    projectComment,
    projectStatus,
    projectTS,
    projectAssignee,
    users,
    canAssignProject,
    closeProject,
    canClose,
    projectProjectedBudgets,
    openAnalyticsDialog
  } = props;
  const mappedStatus = statusMapping(projectStatus);
  const statusIcon = statusIconMapping[projectStatus];
  const openSubprojects = subProjects.find(subproject => subproject.data.status === "open");
  const closeDisabled = !(canClose && _isUndefined(openSubprojects)) || projectStatus === "closed";
  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <List>
          <ListItem>
            {projectName ? <Avatar>{projectName[0]}</Avatar> : null}
            <ListItemText primary={projectName} secondary={projectComment} />
          </ListItem>
          <ListItem>
            <Avatar>
              <DateIcon />
            </Avatar>
            <ListItemText primary={unixTsToString(projectTS)} secondary={strings.common.created} />
          </ListItem>
        </List>
        <div style={styles.projectedBudget}>
          <Typography variant="body1">{strings.common.projectedBudget}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organization</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Currency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectProjectedBudgets.map(budget => (
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
            {projectStatus !== "closed" ? (
              <Tooltip
                id="tooltip-pclose"
                title={closeDisabled ? strings.project.project_close_info : strings.common.close}
              >
                <div>
                  <IconButton color="primary" data-test="pc-button" disabled={closeDisabled} onClick={closeProject}>
                    <DoneIcon />
                  </IconButton>
                </div>
              </Tooltip>
            ) : null}
          </ListItem>
          <ListItem>
            <Avatar style={styles.assingeeIcon}>
              <AssigneeIcon />
            </Avatar>
            <ListItemText
              primary={
                <ProjectAssigneeContainer
                  users={users}
                  projectId={projectId}
                  disabled={!canAssignProject}
                  assignee={projectAssignee}
                />
              }
              secondary={strings.common.assignee}
            />
          </ListItem>
        </List>
      </Card>
      <ProjectAnalyticsDialog projectId={projectId} />
    </div>
  );
};

export default ProjectDetails;
