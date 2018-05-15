import React from "react";
import Card, { CardHeader } from "material-ui/Card";
import Typography from "material-ui/Typography";
import Tooltip from "material-ui/Tooltip";
import { Doughnut } from "react-chartjs-2";
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
import List, { ListItem, ListItemText, ListItemIcon } from "material-ui/List";
import Divider from "material-ui/Divider";
import Chip from "material-ui/Chip";
import Avatar from "material-ui/Avatar";

import Button from "material-ui/Button";
import AmountIcon from "@material-ui/icons/AccountBalance";
import UnspentIcon from "@material-ui/icons/AddCircle";
import DateIcon from "@material-ui/icons/DateRange";
import OpenIcon from "@material-ui/icons/Remove";
import DoneIcon from "@material-ui/icons/Check";
import PermissionIcon from "@material-ui/icons/LockOpen";
import AssigneeIcon from "@material-ui/icons/Group";
import IconButton from "material-ui/IconButton";
import CompletionIcon from "@material-ui/icons/TrendingUp";

import GaugeChart from "../Common/GaugeChart";
import { budgetStatusColorPalette, red } from "../../colors";
import strings from "../../localizeStrings";
import ProjectAssigneeContainer from "./ProjectAssigneeContainer";

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
    justifyContent: "center"
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
  canAssignProject,
  canViewPermissions,
  showProjectPermissions,
  showProjectAssignees,
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
            <ListItemText primary={statusMapping(projectStatus)} secondary={strings.common.status} />
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
            <ListItemIcon>
              <AssigneeIcon />
            </ListItemIcon>
            <ProjectAssigneeContainer projectId={projectId} disabled={!canAssignProject} assignee={projectAssignee} />
          </ListItem>
          <Divider />
          <ListItem style={styles.permissionContainer}>
            <Button
              disabled={!canViewPermissions}
              onClick={showProjectPermissions}
              icon={<PermissionIcon style={styles.icon} />}
              variant="raised"
              color="primary"
            >
              Permissions
            </Button>
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
              <Typography>{statusDetails.done.toString()}</Typography>
              <div>
                <IconButton disabled>
                  <DoneIcon />
                </IconButton>
              </div>
              <Typography variant="caption">{strings.common.done}</Typography>
            </div>
          </div>
        </ListItem>
        <Divider />
      </Card>
    </div>
  );
};

export default ProjectDetails;
