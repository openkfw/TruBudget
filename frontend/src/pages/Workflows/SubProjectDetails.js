import React from "react";

import _isFinite from "lodash/isFinite";
import _isUndefined from "lodash/isUndefined";

import AmountIcon from "@material-ui/icons/AccountBalance";
import AssigneeIcon from "@material-ui/icons/Group";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import DateIcon from "@material-ui/icons/DateRange";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import DoneIcon from "@material-ui/icons/Check";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import NotAssignedIcon from "@material-ui/icons/SpaceBar";
import OpenIcon from "@material-ui/icons/Remove";
import SpentIcon from "@material-ui/icons/RemoveCircle";
import Typography from "@material-ui/core/Typography";
import UnspentIcon from "@material-ui/icons/AddCircle";

import { Doughnut } from "react-chartjs-2";

import {
  toAmountString,
  createTaskData,
  statusIconMapping,
  statusMapping,
  tsToString,
  calculateWorkflowBudget,
  getProgressInformation
} from "../../helper.js";

import GaugeChart from "../Common/GaugeChart";
import strings from "../../localizeStrings";

import SubProjectAssigneeContainer from "./SubProjectAssigneeContainer";

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
  budget: {
    display: "flex",
    flexDirection: "row",
    height: "100%"
  },
  cardMedia: {
    marginBottom: "10px"
  },
  icon: {
    width: "16px",
    height: "20px"
  },
  editIcon: {
    marginLeft: "5px",
    marginTop: "11px"
  },

  doneIcon: {
    marginLeft: "9px",
    marginTop: "22px"
  },
  textfield: {
    width: "60%",
    marginLeft: "-15px",
    marginTop: "-10px"
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
  distributionPlaceholder: {
    height: "70%",
    padding: "16px",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column"
  }
};

const displaySubprojectBudget = budgets => {
  return (
    <div>
      {budgets.map((b, i) => {
        return (
          <div key={`subprojectedBudget-wf-${i}`} style={styles.budgets}>
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

const getNotEditableBudget = (amountString, allowedToEdit, { ...props }) => {
  return (
    <div style={styles.budget}>
      <ListItem disabled={false}>
        <ListItemIcon>
          <AmountIcon />
        </ListItemIcon>
        <ListItemText primary={amountString} secondary={strings.common.budget} />
      </ListItem>
    </div>
  );
};

const createRatio = ratio => ratio * 100;

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
  amount,
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
  ...props
}) => {
  // const amountString = toAmountString(amount, currency);
  const amountString = displaySubprojectBudget(props.projectedBudgets);
  const mappedStatus = statusMapping(status);
  const statusIcon = statusIconMapping[status];
  const date = tsToString(created);

  const closingOfSubProjectAllowed = subProjectCanBeClosed(status === "closed", canCloseSubproject, workflowItems);
  const { assigned: assignedBudget, disbursed: disbursedBudget, currentDisbursement } = calculateWorkflowBudget(
    workflowItems
  );

  const disbursedBudgetString = toAmountString(disbursedBudget, currency);
  const unSpendBudgetString = toAmountString(assignedBudget, currency);
  const spendBudgetString = toAmountString(currentDisbursement, currency);

  const statusDetails = getProgressInformation(workflowItems);

  const allowedToEdit = false;

  const allocatedBudgetRatio = !_isFinite(amount) || amount === 0 ? 0 : assignedBudget / amount;
  const consumptionBudgetRatio = !_isFinite(amount) || assignedBudget === 0 ? 0 : currentDisbursement / assignedBudget;
  const currentDisbursementRatio = !_isFinite(amount) || assignedBudget === 0 ? 0 : disbursedBudget / assignedBudget;

  const containsRedactedWorkflowItems = workflowItems.find(w => w.data.displayName === null);

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <CardHeader
          title={displayName}
          subheader={description}
          avatar={displayName ? <Avatar>{displayName[0]}</Avatar> : null}
        />
        <List>
          <Divider />
          {getNotEditableBudget(amountString, allowedToEdit, props)}
          <Divider />
          <ListItem>
            <ListItemIcon>{statusIcon}</ListItemIcon>
            <div style={styles.statusContainer}>
              <ListItemText style={styles.statusText} primary={mappedStatus} secondary={strings.common.status} />
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
            </div>
          </ListItem>
          <Divider />
          <ListItem disabled={false}>
            <ListItemIcon>
              <DateIcon />
            </ListItemIcon>
            <ListItemText primary={date} secondary={strings.common.created} />
          </ListItem>
          <Divider />
          <ListItem disabled={false}>
            <ListItemIcon style={styles.assingeeIcon}>
              <AssigneeIcon />
            </ListItemIcon>
            <div style={styles.assigneeContainer}>
              <SubProjectAssigneeContainer
                projectId={parentProject ? parentProject.id : ""}
                subprojectId={id}
                users={users}
                disabled={!canAssignSubproject}
                assignee={assignee}
              />
              <ListItemText style={styles.assigneeText} secondary={strings.common.assignee} />
            </div>
          </ListItem>
        </List>
      </Card>
      <Card style={styles.card}>
        <CardHeader title={strings.common.budget_distribution} />
        <Divider />
        {containsRedactedWorkflowItems ? (
          <div style={styles.distributionPlaceholder}>
            <Typography variant="caption">{strings.common.no_budget_distribution}</Typography>
          </div>
        ) : (
          <div>
            <div style={styles.charts}>
              <div style={styles.listItem}>
                <ListItem style={styles.budgetDistListItem}>
                  <ListItemIcon>
                    <UnspentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={unSpendBudgetString}
                    secondary={strings.common.assigned_budget}
                    style={styles.budgetDistListItem}
                  />
                </ListItem>
              </div>
              <div style={styles.chart}>
                <GaugeChart size={0.2} responsive={false} value={createRatio(allocatedBudgetRatio)} />
              </div>
            </div>
            <Divider />
            <div style={styles.charts}>
              <div style={styles.listItem}>
                <ListItem style={styles.budgetDistListItem}>
                  <ListItemIcon>
                    <SpentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={spendBudgetString}
                    secondary={strings.common.disbursed_budget}
                    style={styles.budgetDistListItem}
                  />
                </ListItem>
              </div>
              <div style={styles.chart}>
                <GaugeChart size={0.2} responsive={false} value={createRatio(consumptionBudgetRatio)} />
              </div>
            </div>
            <Divider />
            <div style={styles.charts}>
              <div style={styles.listItem}>
                <ListItem style={styles.budgetDistListItem}>
                  <ListItemIcon>
                    <NotAssignedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={disbursedBudgetString}
                    secondary={strings.common.disbursement}
                    style={styles.budgetDistListItem}
                  />
                </ListItem>
              </div>
              <div style={styles.chart}>
                <GaugeChart size={0.2} responsive={false} value={createRatio(currentDisbursementRatio)} />
              </div>
            </div>
          </div>
        )}
        <Divider />
      </Card>
      <Card style={styles.card}>
        <CardHeader title={strings.common.task_status} />
        <Divider />
        <ListItem style={styles.cardMedia}>
          <Doughnut data={createTaskData(workflowItems, "workflows")} />
        </ListItem>
        <Divider />
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
export default SubProjectDetails;
