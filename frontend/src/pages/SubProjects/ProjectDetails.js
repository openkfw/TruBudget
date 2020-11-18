import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Chip from "@material-ui/core/Chip";
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
import BarChartIcon from "@material-ui/icons/BarChart";
import DoneIcon from "@material-ui/icons/Check";
import DateIcon from "@material-ui/icons/DateRange";
import AssigneeIcon from "@material-ui/icons/Group";
import LabelIcon from "@material-ui/icons/Label";
import _isEmpty from "lodash/isEmpty";
import React from "react";

import { formattedTag, statusIconMapping, statusMapping, toAmountString, unixTsToString } from "../../helper.js";
import strings from "../../localizeStrings";
import ProjectAnalyticsDialog from "../Analytics/ProjectAnalyticsDialog";
import BudgetEmptyState from "../Common/BudgetEmptyState";
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
    paddingTop: "18px",
    width: "32%"
  },
  projectDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "18px",
    width: "31%",
    overflowWrap: "break-word"
  },
  projectAssignee: {
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

const displayTags = tags => {
  return tags.map((tag, i) => (
    <Chip
      key={`${tag}-${i}`}
      label={`#${formattedTag(tag)}`}
      style={{ margin: "1px" }}
      clickable={false}
      size="small"
      component="span"
      data-test="project-details-tag"
    />
  ));
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
    isDataLoading,
    projectProjectedBudgets,
    openAnalyticsDialog,
    projectTags
  } = props;
  const mappedStatus = statusMapping(projectStatus);
  const statusIcon = statusIconMapping[projectStatus];
  const hasOpenSubprojects = !_isEmpty(subProjects.find(subproject => subproject.data.status === "open"));
  const closeDisabled = !canClose || hasOpenSubprojects || projectStatus === "closed";
  const tags = displayTags(projectTags || []);
  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <List style={styles.projectDetails}>
          <ListItem>
            {projectName ? (
              <ListItemAvatar>
                <Avatar>{projectName[0]}</Avatar>
              </ListItemAvatar>
            ) : null}
            <ListItemText primary={projectName} secondary={projectComment} />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <DateIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={unixTsToString(projectTS)} secondary={strings.common.created} />
          </ListItem>
          {tags.length > 0 ? (
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <LabelIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={tags} />
            </ListItem>
          ) : null}
        </List>
        <div style={styles.projectedBudget} data-test="project-projected-budget">
          <Typography variant="body1">{strings.common.total_budget}</Typography>
          {isDataLoading ? (
            <div />
          ) : projectProjectedBudgets.length > 0 ? (
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
                  {projectProjectedBudgets.map(budget => (
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
            <BudgetEmptyState text={strings.common.no_budget_project} />
          )}
        </div>
        <List style={styles.projectAssignee}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>{statusIcon}</Avatar>
            </ListItemAvatar>
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
            <ListItemAvatar>
              <Avatar style={styles.assingeeIcon}>
                <AssigneeIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <ProjectAssigneeContainer users={users} disabled={!canAssignProject} assignee={projectAssignee} />
              }
              secondary={strings.common.assignee}
            />
          </ListItem>
        </List>
      </Card>
      <ProjectAnalyticsDialog projectId={projectId} projectProjectedBudgets={projectProjectedBudgets} />
    </div>
  );
};

export default ProjectDetails;
