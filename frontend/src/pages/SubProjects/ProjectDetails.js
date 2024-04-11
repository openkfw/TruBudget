import React from "react";
import _isEmpty from "lodash/isEmpty";

import DoneIcon from "@mui/icons-material/Check";
import DateIcon from "@mui/icons-material/DateRange";
import AssigneeIcon from "@mui/icons-material/Group";
import LabelIcon from "@mui/icons-material/Label";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { formattedTag, statusIconMapping, statusMapping, unixTsToString } from "../../helper.js";
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
        <div className="project-projected-budget" data-test="project-projected-budget">
          <Typography variant="body1">{strings.common.total_budget}</Typography>

          <BudgetEmptyState text={strings.common.no_budget_project} />
        </div>
        <List className="project-assignee">
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
