import React from 'react';
import _ from 'lodash';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';

import { toAmountString, fromAmountString, createTaskData, statusIconMapping, statusMapping, tsToString, calculateWorkflowBudget, getProgressInformation, getNextIncompletedItem, getNextAction, getAssignedOrganization } from '../../helper.js'
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import CommentIcon from 'material-ui/svg-icons/editor/short-text';
import AmountIcon from 'material-ui/svg-icons/action/account-balance';
import UnspentIcon from 'material-ui/svg-icons/content/add-circle';
import SpentIcon from 'material-ui/svg-icons/content/remove-circle';
import NotAssignedIcon from 'material-ui/svg-icons/editor/space-bar'
import DateIcon from 'material-ui/svg-icons/action/date-range';
import ActiveIcon from 'material-ui/svg-icons/image/navigate-next';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InProgressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import AssigneeIcon from 'material-ui/svg-icons/social/group';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import ReviewIcon from 'material-ui/svg-icons/action/find-in-page';
import EditIcon from 'material-ui/svg-icons/image/edit';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';

import GaugeChart from '../Common/GaugeChart';
import strings from '../../localizeStrings';

import {
  ACMECorpLightgreen,
} from '../../colors'

import { workflowBudgetColorPalette, red } from '../../colors'

const styles = {
  container: {
    display: 'flex',
    height: '30%',
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    marginBottom: '24px',
    justifyContent: 'space-between'
  },
  card: {
    width: '31%'
  },
  text: {
    fontSize: '14px',
  },

  overspent: {
    color: red
  },

  tasksChart: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  taskChartItem: {
    width: '33%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  comment: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  iconButton: {
    padding: '0px',
    height: '0px',
  },
  tooltip: {
    top: '12px'
  },
  budget: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%'
  },
  cardMedia: {
    marginBottom: '10px'
  },
  icon: {
    width: '16px', height: '20px'
  },
  editIcon: {
    marginLeft: '5px',
    marginTop: '11px'
  },

  doneIcon: {
    marginLeft: '9px',
    marginTop: '22px'
  },
  textfield: {
    width: '60%',
    marginLeft: '-15px',
    marginTop: '-10px'
  },
  charts: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
    marginBottom: '10px',
    marginRight: '10px'
  }
}

const enableEditMode = ({ storeSubProjectAmount, enableBudgetEdit }, amountString) => {
  const amount = fromAmountString(amountString)
  enableBudgetEdit()
  storeSubProjectAmount(amount)
}

const getNotEditableBudget = (amountString, allowedToEdit, { ...props }) => {
  return (
    <div style={styles.budget}>
      <ListItem
        disabled={true}
        leftIcon={<AmountIcon />}
        primaryText={amountString}
        secondaryText={strings.common.budget}
      />
      <EditIcon style={styles.editIcon} onTouchTap={() => enableEditMode(props, amountString)} />
    </div>
  )
}

const disableEditMode = (subProjectAmount, storeSubProjectAmount, { disableBudgetEdit, location, postSubProjectEdit }) => {
  storeSubProjectAmount(0)
  postSubProjectEdit(location.pathname.split('/')[2], location.pathname.split('/')[3], 'open', subProjectAmount)
  disableBudgetEdit()
}

const getEditableBudget = ({ storeSubProjectAmount, subProjectAmount, ...props }) => {
  const floatingLabelText = strings.common.budget
  return (
    <div style={styles.budget}>
      <ListItem
        style={{ marginTop: '10px' }}
        disabled={true}
        leftIcon={<AmountIcon />}
      />
      <TextField
        floatingLabelText={floatingLabelText}
        style={styles.textfield}
        type='number'
        value={subProjectAmount}
        onChange={(event) => storeSubProjectAmount(event.target.value)}
      />
      <DoneIcon color={ACMECorpLightgreen} style={styles.doneIcon} onTouchTap={() => disableEditMode(subProjectAmount, storeSubProjectAmount, props)} />
    </div>
  )
}

const createRatio = (ratio) => _.isNaN(ratio) ? 0 : ratio * 100

const SubProjectDetails = ({
  displayName, description, amount, currency,
  status, roles, subProjectDetails, workflowItems,
  created, budgetEditEnabled, permissions, ...props }) => {

  const amountString = toAmountString(amount, currency)
  const mappedStatus = statusMapping(status)
  const statusIcon = statusIconMapping[status]
  const date = tsToString(created)

  const { assigned: assignedBudget, disbursed: disbursedBudget, currentDisbursement } = calculateWorkflowBudget(workflowItems);

  const disbursedBudgetString = toAmountString(disbursedBudget, currency);
  const unSpendBudgetString = toAmountString(assignedBudget, currency);
  const spendBudgetString = toAmountString(currentDisbursement, currency);

  const statusDetails = getProgressInformation(workflowItems)
  const nextIncompletedWorkflow = getNextIncompletedItem(workflowItems)

  const allowedToWrite = false;
  const allowedToEdit = false;

  const allocatedBudgetRatio = _.isUndefined(amount) ? 0 : assignedBudget / amount;
  const consumptionBudgetRatio = _.isUndefined(amount) ? 0 : currentDisbursement / assignedBudget;
  const currentDisbursementRatio = _.isUndefined(amount) ? 0 : disbursedBudget / assignedBudget;

  return (
    <div style={styles.container}>
      <Card style={styles.card} >
        <CardTitle title={displayName} />
        <List>
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<CommentIcon />}
            primaryText={<div style={styles.comment}>{description} </div>}
            secondaryText={strings.common.comment}
          />
          <Divider />
          {budgetEditEnabled && allowedToEdit ? getEditableBudget(props) : getNotEditableBudget(amountString, allowedToEdit, props)}
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={statusIcon}
            primaryText={mappedStatus}
            secondaryText={strings.common.status}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<DateIcon />}
            primaryText={date}
            secondaryText={strings.common.created}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<AssigneeIcon />}
            primaryText={""}
            secondaryText={strings.common.assignees}
          />
          <Divider />
        </List>
        <CardText style={{
        }}>
        </CardText>
      </Card>
      <Card style={styles.card}>
        <CardTitle title={strings.common.budget_distribution} />
        <Divider />
        <div style={styles.charts}>
          <ListItem style={styles.text}
            disabled={true}
            leftIcon={<UnspentIcon color={workflowBudgetColorPalette[1]} />}
            primaryText={unSpendBudgetString}
            secondaryText={strings.common.assigned_budget}
          />
          <GaugeChart size={0.20} responsive={false} value={createRatio(allocatedBudgetRatio)} />
        </div>
        <Divider />
        <div style={styles.charts}>
          <ListItem style={styles.text}
            disabled={true}
            leftIcon={<SpentIcon color={workflowBudgetColorPalette[2]} />}
            primaryText={spendBudgetString}
            secondaryText={strings.common.disbursed_budget}
          />
          <GaugeChart size={0.20} responsive={false} value={createRatio(consumptionBudgetRatio)} />
        </div>
        <Divider />
        <div style={styles.charts}>
          <ListItem style={styles.text}
            disabled={true}
            leftIcon={<NotAssignedIcon color={workflowBudgetColorPalette[0]} />}
            primaryText={disbursedBudgetString}
            secondaryText={strings.common.disbursement}
          />
          <GaugeChart size={0.20} responsive={false} value={createRatio(currentDisbursementRatio)} />
        </div>


        <Divider />

      </Card>
      <Card style={styles.card}>
        <CardTitle title={strings.common.task_status} />
        <Divider />
        <CardMedia style={styles.cardMedia}>
          <Doughnut data={createTaskData(workflowItems, 'workflows')} />
        </CardMedia>
        <Divider />
        <ListItem disabled={true}>
          <div style={styles.tasksChart}>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.open.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip={strings.common.open} style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon} >
                  <OpenIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.inProgress.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip={strings.common.in_progress} style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon}>
                  <InProgressIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.inReview.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip={strings.common.in_review} style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon}>
                  <ReviewIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.done.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip={strings.common.done} style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon} >
                  <DoneIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </ListItem>
        <Divider />
      </Card>

    </div >


  )
}
export default SubProjectDetails;
