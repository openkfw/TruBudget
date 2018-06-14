import React from "react";

import { Doughnut } from "react-chartjs-2";
import _isUndefined from "lodash/isUndefined";

import AmountIcon from "@material-ui/icons/AccountBalance";
import AssigneeIcon from "@material-ui/icons/Group";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CompletionIcon from "@material-ui/icons/TrendingUp";
import DateIcon from "@material-ui/icons/DateRange";
import Divider from "@material-ui/core/Divider";
import DoneIcon from "@material-ui/icons/Check";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import OpenIcon from "@material-ui/icons/Remove";
import Typography from "@material-ui/core/Typography";
import UnspentIcon from "@material-ui/icons/AddCircle";
import Red from "@material-ui/core/colors/red";

import {
  toAmountString,
  getAllocationRatio,
  getCompletionRatio,
  getCompletionString,
  createTaskData,
  statusIconMapping,
  statusMapping,
  tsToString,
  calculateUnspentAmount,
  getProgressInformation
} from "../../helper.js";

import GaugeChart from "../Common/GaugeChart";
import strings from "../../localizeStrings";
import ProjectAssigneeContainer from "./ProjectAssigneeContainer";

const red = Red[500];

const styles = {
  container: {
    display: "flex",
    height: "30%",
    flex: 1,
    flexDirection: "row",
    width: "100%",
    maxHeight: "500px",
    marginBottom: "32px",
    justifyContent: "space-between"
  },
  card: {
    width: "31%"
  },
  permissionContainer: {
    display: "flex",
    justifyContent: "space-around"
  },
  text: {
    fontSize: "14px"
  },
  tasksChart: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  taskChartItem: {
    width: "33%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  comment: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden"
  },
  iconButton: {
    padding: "0px",
    height: "0px"
  },
  tooltip: {
    top: "12px"
  },
  cardMedia: {
    marginBottom: "10px"
  },
  icon: {
    width: "16px",
    height: "20px"
  },
  overspent: {
    color: red
  },
  charts: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    marginBottom: "10px",
    marginRight: "10px"
  },
  assingeeIcon: {
    marginRight: "30px"
  },
  statusText: {
    marginLeft: 15
  },
  statusContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }
};

const calculateMetrics = (subProjects, projectAmount, projectCurrency) => {
  const spentAmount = calculateUnspentAmount(subProjects);
  return {
    spentAmount,
    amountString: toAmountString(projectAmount, projectCurrency),
    completionRatio: getCompletionRatio(subProjects),
    completionString: getCompletionString(subProjects),
    spentAmountString: toAmountString(spentAmount.toString(), projectCurrency),
    statusDetails: getProgressInformation(subProjects),
    allocatedRatio: getAllocationRatio(spentAmount, projectAmount)
  };
};

const ProjectDetails = ({
  projectName,
  projectCurrency,
  projectAmount,
  projectId,
  subProjects,
  projectComment,
  projectStatus,
  projectTS,
  projectAssignee,
  roles,
  thumbnail,
  users,
  canAssignProject,
  canViewPermissions,
  showProjectPermissions,
  showProjectAssignees,
  closeProject,
  canClose,
  ...rest
}) => {
  const {
    amountString,
    completionRatio,
    completionString,
    spentAmountString,
    statusDetails,
    allocatedRatio
  } = calculateMetrics(subProjects, projectAmount, projectCurrency);

  const openSubprojects = subProjects.find(subproject => subproject.data.status === "open");
  const closeDisabled = !(canClose && _isUndefined(openSubprojects)) || projectStatus === "closed";

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <CardHeader title={projectName} subheader={projectComment} avatar={<Avatar>{projectName[0]}</Avatar>} />
        <List>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <AmountIcon />
            </ListItemIcon>
            <ListItemText
              primary={<div aria-label="projectbudget"> {amountString} </div>}
              secondary={strings.common.budget}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>{statusIconMapping[projectStatus]}</ListItemIcon>
            <div style={styles.statusContainer}>
              <ListItemText
                style={styles.statusText}
                primary={statusMapping(projectStatus)}
                secondary={strings.common.status}
              />
              <div>
                <Tooltip disabled={true} id="tooltip-pclose" title="Close project">
                  <div>
                    <IconButton color="primary" data-test="pc-button" disabled={closeDisabled} onClick={closeProject}>
                      <DoneIcon />
                    </IconButton>
                  </div>
                </Tooltip>
              </div>
            </div>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <DateIcon />
            </ListItemIcon>
            <ListItemText primary={tsToString(projectTS)} secondary={strings.common.created} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon style={styles.assingeeIcon}>
              <AssigneeIcon />
            </ListItemIcon>
            <ProjectAssigneeContainer
              users={users}
              projectId={projectId}
              disabled={!canAssignProject}
              assignee={projectAssignee}
            />
          </ListItem>
        </List>
      </Card>

      <Card style={styles.card}>
        <CardHeader title={strings.common.budget_distribution} />
        <Divider />
        <div style={styles.charts}>
          <ListItem style={styles.text}>
            <ListItemIcon>
              <UnspentIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={spentAmountString} secondary={strings.common.assigned_budget} />
          </ListItem>
          <GaugeChart size={0.2} responsive={false} value={allocatedRatio} />
        </div>

        <Divider />
        <div style={styles.charts}>
          <ListItem style={styles.text}>
            <ListItemIcon>
              <CompletionIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={completionString} secondary={strings.common.completion} />
          </ListItem>
          <GaugeChart size={0.2} responsive={false} value={completionRatio} />
        </div>
        <Divider />
      </Card>
      <Card style={styles.card}>
        <CardHeader title={strings.common.task_status} />
        <Divider />
        <ListItem style={styles.cardMedia}>
          <Doughnut data={createTaskData(subProjects, "subprojects")} />
        </ListItem>
        <ListItem>
          <div style={styles.tasksChart}>
            <div style={styles.taskChartItem}>
              <Typography>{statusDetails.open.toString()}</Typography>
              <div>
                <IconButton disabled>
                  <OpenIcon />
                </IconButton>
              </div>
              <Typography variant="caption">{strings.common.open}</Typography>
            </div>
            <div style={styles.taskChartItem}>
              <Typography>{statusDetails.closed.toString()}</Typography>
              <div>
                <IconButton disabled>
                  <DoneIcon />
                </IconButton>
              </div>
              <Typography variant="caption">{strings.common.closed}</Typography>
            </div>
          </div>
        </ListItem>
        <Divider />
      </Card>
    </div>
  );
};

export default ProjectDetails;
