import React, { useEffect, useRef } from "react";
import _isEmpty from "lodash/isEmpty";

import BarChartIcon from "@mui/icons-material/BarChart";
import DoneIcon from "@mui/icons-material/Check";
import DateIcon from "@mui/icons-material/DateRange";
import AssigneeIcon from "@mui/icons-material/Group";
import LabelIcon from "@mui/icons-material/Label";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { useTourAppContext } from "../../context/tour.js";
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

const displayTags = (tags) => {
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

const ProjectDetails = (props) => {
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
  const hasOpenSubprojects = !_isEmpty(subProjects.find((subproject) => subproject.data.status === "open"));
  const closeDisabled = !canClose || hasOpenSubprojects || projectStatus === "closed";
  const tags = displayTags(projectTags || []);

  const {
    setState,
    state: { tourActive }
  } = useTourAppContext();

  const ref = useRef();

  useEffect(() => {
    if (tourActive && !ref.current) {
      setTimeout(() => {
        setState({ run: true });
      }, 1200);
      ref.current = true;
    }
  });

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
                  {projectProjectedBudgets.map((budget) => (
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
                  <IconButton
                    aria-label="close"
                    color="primary"
                    data-test="pc-button"
                    disabled={closeDisabled}
                    onClick={closeProject}
                    size="large"
                  >
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
              secondary={strings.project.assignee}
            />
          </ListItem>
        </List>
      </Card>
      <ProjectAnalyticsDialog projectId={projectId} projectProjectedBudgets={projectProjectedBudgets} />
    </div>
  );
};

export default ProjectDetails;
