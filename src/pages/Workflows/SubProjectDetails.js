import React from 'react';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';

import { toAmountString, fromAmountString, createAmountData, createSubprojectAmountData, createTaskData, statusIconMapping, statusMapping, tsToString, calculateUnspentAmount, getProgressInformation, getNextIncompletedItem, getNextAction, getAssignedOrganization } from '../../helper.js'
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import PurposeIcon from 'material-ui/svg-icons/editor/short-text';
import AmountIcon from 'material-ui/svg-icons/action/account-balance';
import UnspentIcon from 'material-ui/svg-icons/content/add-circle';
import SpentIcon from 'material-ui/svg-icons/content/remove-circle';
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

import {
  ACMECorpLightgreen,
} from '../../colors'

import { budgetStatusColorPalette, red } from '../../colors'

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
  purpose: {
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
  }
}

const getNotEditableBudget = (amountString, allowedToEdit, { ...props }) => {
  return (
    <div style={styles.budget}>
      <ListItem
        disabled={true}
        leftIcon={<AmountIcon />}
        primaryText={amountString}
        secondaryText={'Budget'}
      />
      <EditIcon style={styles.editIcon} onTouchTap={() => enableEditMode(props, amountString)} />
    </div>
  )
}

const enableEditMode = ({ storeSubProjectAmount, enableBudgetEdit }, amountString) => {
  const amount = fromAmountString(amountString)
  enableBudgetEdit()
  storeSubProjectAmount(amount)
}

const getEditableBudget = ({ storeSubProjectAmount, subProjectAmount, ...props }) => {
  const floatingLabelText = "Budget"
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
      <DoneIcon color={ACMECorpLightgreen} style={styles.doneIcon} onTouchTap={() => disableEditMode(subProjectAmount, props)} />
    </div>
  )
}

const disableEditMode = (subProjectAmount, { disableBudgetEdit, location, postSubProjectEdit }) => {
  postSubProjectEdit(location.pathname.split('/')[2], location.pathname.split('/')[3], 'open', subProjectAmount)
  disableBudgetEdit()
}

const SubProjectDetails = ({ subProjectDetails, workflowItems, budgetEditEnabled, permissions, ...props }) => {
  const name = subProjectDetails.projectName
  const purpose = subProjectDetails.purpose
  const amount = subProjectDetails.amount
  const currency = subProjectDetails.currency


  const assignee = getAssignedOrganization(subProjectDetails.assignee)
  const bank = subProjectDetails.bank
  const approver = subProjectDetails.approver


  const amountString = toAmountString(amount, currency)
  const status = statusMapping[subProjectDetails.status]
  const statusIcon = statusIconMapping[subProjectDetails.status]
  const date = tsToString(subProjectDetails.createTS)

  const items = workflowItems.map((item) => ({ ...item, details: item.data }));
  const spentAmount = calculateUnspentAmount(items)
  const unspentAmount = amount - spentAmount;
  const correctedUnspentAmount = unspentAmount > 0 ? unspentAmount : 0
  const spentAmountString = toAmountString(spentAmount.toString(), currency);
  const unspentAmountString = toAmountString(correctedUnspentAmount.toString(), currency);
  const statusDetails = getProgressInformation(items)
  const nextIncompletedWorkflow = getNextIncompletedItem(items)
  const nextAction = getNextAction(nextIncompletedWorkflow, assignee, bank, approver)

  const allowedToWrite = props.loggedInUser.role.write;
  const allowedToEdit = allowedToWrite && permissions.isAssignee;
  return (
    <div style={styles.container}>
      <Card style={styles.card} >
        <CardTitle title={name} />
        <List>
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<PurposeIcon />}
            primaryText={<div style={styles.purpose}>{purpose} </div>}
            secondaryText={'Purpose'}
          />
          <Divider />
          {budgetEditEnabled && allowedToEdit ? getEditableBudget(props) : getNotEditableBudget(amountString, allowedToEdit, props)}
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={statusIcon}
            primaryText={status}
            secondaryText={'Status'}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<DateIcon />}
            primaryText={date}
            secondaryText={'Created'}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<AssigneeIcon />}
            primaryText={assignee}
            secondaryText={'Assignee(s)'}
          />
          <Divider />
        </List>
        <CardText style={{
        }}>
        </CardText>
      </Card>
      <Card style={styles.card}>
        <CardTitle title="Budget distribution" />
        <Divider />
        <CardMedia style={styles.cardMedia}>
          <Doughnut data={createSubprojectAmountData(amount, items)} />
        </CardMedia>
        <Divider />
        <ListItem style={styles.text}
          disabled={true}
          leftIcon={<UnspentIcon color={budgetStatusColorPalette[1]} />}
          primaryText={unspentAmountString}
          secondaryText={"Not assigned"}
        />
        <Divider />
        <ListItem style={styles.text}
          disabled={true}
          leftIcon={<SpentIcon color={budgetStatusColorPalette[0]} />}
          primaryText={spentAmountString}
          secondaryText={correctedUnspentAmount > 0 ?
            <span> {'Assigned'} </span > :
            <span> {'Assigned'}
              <span style={styles.overspent}> {'(Overspent)'}
              </span>
            </span>}
        />
        <Divider />
      </Card>
      <Card style={styles.card}>
        <CardTitle title="Task status" />
        <Divider />
        <CardMedia style={styles.cardMedia}>
          <Doughnut data={createTaskData(items, 'workflows')} />
        </CardMedia>
        <Divider />
        <ListItem disabled={true}>
          <div style={styles.tasksChart}>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.open.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="Open" style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon} >
                  <OpenIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.inProgress.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="In progress" style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon}>
                  <InProgressIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.inReview.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="In Review" style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon}>
                  <ReviewIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.done.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="Done" style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon} >
                  <DoneIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </ListItem>
        <Divider />

        <ListItem
          disabled={true}
          leftIcon={<ActiveIcon />}
          //  primaryText={typeof nextIncompletedWorkflow !== "undefined" ? nextIncompletedWorkflow.key : 'None'}
          primaryText={<div>
            <span >{typeof nextIncompletedWorkflow !== "undefined" ? nextIncompletedWorkflow.data.workflowName : 'None'}</span> <br />
            {nextAction}
          </div>}
          secondaryText={'Next step'}
        />
        <Divider />


      </Card>

    </div >


  )
}
export default SubProjectDetails;
