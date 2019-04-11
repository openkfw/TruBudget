import React from "react";

import { Doughnut } from "react-chartjs-2";
import _isUndefined from "lodash/isUndefined";

import AmountIcon from "@material-ui/icons/AccountBalance";
import AssigneeIcon from "@material-ui/icons/Group";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
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
  calculateUnspentAmount,
  getProgressInformation,
  unixTsToString
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
    marginRight: "10px",
    width: "100%",
    whiteSpace: "nowrap",
    flexWrap: "wrap"
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
  },
  assigneeContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%"
  },
  assigneeText: {
    marginLeft: "-13px",
    paddingTop: "6px"
  },
  listItem: {
    minWidth: "65%"
  },
  budgetDistListItem: {
    paddingRight: "0px",
    fontSize: "14px"
  },
  chart: {
    marginRight: 20,
    maxWidth: "55%",
    display: "flex",
    justifyContent: "center",
    paddingLeft: "12px"
  },
  budgets: {
    marginBottom: "8px"
  }
};

const displayProjectBudget = budgets => {
  return (
    <div>
      {budgets.map((b, i) => {
        return (
          <div key={`projectedBudget-sp-${i}`} style={styles.budgets}>
            <Tooltip title={b.organization}>
              <Chip
                avatar={<Avatar>{b.organization.slice(0, 1)}</Avatar>}
                label={toAmountString(b.value, b.currencyCode)}
              />
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

const calculateMetrics = (subProjects, projectAmount, projectCurrency, projectProjectedBudgets) => {
  const spentAmount = calculateUnspentAmount(subProjects);
  return {
    spentAmount,
    amountString: displayProjectBudget(projectProjectedBudgets),
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
  projectProjectedBudgets,
  ...rest
}) => {
  const {
    amountString,
    completionRatio,
    completionString,
    spentAmountString,
    statusDetails,
    allocatedRatio
  } = calculateMetrics(subProjects, projectAmount, projectCurrency, projectProjectedBudgets);

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
              secondary={strings.common.projectedBudget}
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
              </div>
            </div>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <DateIcon />
            </ListItemIcon>
            <ListItemText primary={unixTsToString(projectTS)} secondary={strings.common.created} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon style={styles.assingeeIcon}>
              <AssigneeIcon />
            </ListItemIcon>
            <div style={{ ...styles.assigneeContainer, width: "80%" }}>
              <ProjectAssigneeContainer
                users={users}
                projectId={projectId}
                disabled={!canAssignProject}
                assignee={projectAssignee}
              />
              <ListItemText style={styles.assigneeText} secondary={strings.common.assignee} />
            </div>
          </ListItem>
        </List>
      </Card>

      <Card style={styles.card}>
        <CardHeader title={strings.common.budget_distribution} />
        <Divider />
        <div style={styles.charts}>
          <div style={styles.listItem}>
            <ListItem style={styles.budgetDistListItem}>
              <ListItemIcon>
                <UnspentIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={spentAmountString}
                secondary={strings.common.assigned_budget}
                style={styles.budgetDistListItem}
              />
            </ListItem>
          </div>
          <div style={styles.chart}>
            <GaugeChart size={0.2} responsive={false} value={allocatedRatio} />
          </div>
        </div>

        <Divider />
        <div style={styles.charts}>
          <div style={styles.listItem}>
            <ListItem style={styles.budgetDistListItem}>
              <ListItemIcon>
                <CompletionIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={completionString}
                secondary={strings.common.completion}
                style={styles.budgetDistListItem}
              />
            </ListItem>
          </div>
          <div style={styles.chart}>
            <GaugeChart size={0.2} responsive={false} value={completionRatio} />
          </div>
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
