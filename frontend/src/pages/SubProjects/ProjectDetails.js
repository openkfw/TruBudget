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
import {
  formattedTag,
  statusIconMapping,
  statusMapping,
  toAmountString,
  toCurrencyCode,
  trimSpecialChars,
  unixTsToString
} from "../../helper.js";
import strings from "../../localizeStrings";
import ProjectAnalyticsDialog from "../Analytics/ProjectAnalyticsDialog";
import BudgetEmptyState from "../Common/BudgetEmptyState";

import ProjectAssigneeContainer from "./ProjectAssigneeContainer";

import "./ProjectDetails.scss";

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
    state: { tourActive },
    goToNextStepIf
  } = useTourAppContext();

  const ref = useRef();

  useEffect(() => {
    let timer;
    if (tourActive && !ref.current) {
      goToNextStepIf();
      timer = setTimeout(() => {
        setState({ run: true });
      }, 1200);
      ref.current = true;
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  });

  return (
    <div className="project-details-container">
      <Card className="project-details-card">
        <List className="project-details-list">
          <ListItem>
            {projectName ? (
              <ListItemAvatar>
                <Avatar>{projectName[0]}</Avatar>
              </ListItemAvatar>
            ) : null}
            <ListItemText primary={trimSpecialChars(projectName)} secondary={projectComment} />
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
        <div className="project-projected-budget" data-test="project-projected-budget">
          <Typography variant="body1">{strings.common.total_budget}</Typography>
          {isDataLoading ? (
            <div />
          ) : projectProjectedBudgets.length > 0 ? (
            <div>
              <Table padding="none">
                <TableHead>
                  <TableRow>
                    <TableCell className="project-table-cell">{strings.common.organization}</TableCell>
                    <TableCell className="project-table-cell" align="right">
                      {strings.common.amount}
                    </TableCell>
                    <TableCell className="project-table-cell" align="right">
                      {strings.common.currency}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectProjectedBudgets.map((budget) => (
                    <TableRow key={budget.organization + budget.currencyCode}>
                      <TableCell className="project-table-cell">{budget.organization}</TableCell>
                      <TableCell className="project-table-cell" align="right">
                        {toAmountString(budget.value, undefined, true)}
                      </TableCell>
                      <TableCell className="project-table-cell" align="right">
                        {toCurrencyCode(budget.value, budget.currencyCode, true)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="project-analytics">
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
        <List className="project-assignee">
          <ListItem data-test="project-overal-status">
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
              <Avatar>
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
