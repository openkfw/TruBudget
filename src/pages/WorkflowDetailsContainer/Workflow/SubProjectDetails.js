import React from 'react';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';

import { toAmountString, createAmountData, createTaskData, statusIconMapping, statusMapping, tsToString, calculateUnspentAmount, getProgressInformation, getNextIncompletedItem } from '../../../helper.js'
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
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import IconButton from 'material-ui/IconButton';

import { budgetStatusColorPalette } from '../../../colors'

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
  cardMedia: {
    marginBottom: '10px'
  },
  icon: {
    width: '16px', height: '20px'
  },
}

const SubProjectDetails = ({ subProjectDetails, workflowItems }) => {
  const name = subProjectDetails.projectName
  const purpose = subProjectDetails.purpose
  const amount = subProjectDetails.amount
  const currency = subProjectDetails.currency
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
          <ListItem
            disabled={true}
            leftIcon={<AmountIcon />}
            primaryText={amountString}
            secondaryText={'Budget'}
          />
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

        </List>
        <CardText style={{
        }}>
        </CardText>
      </Card>
      <Card style={styles.card}>
        <CardTitle title="Budget distribution" />
        <Divider />
        <CardMedia style={styles.cardMedia}>
          <Doughnut data={createAmountData(amount, items)} />
        </CardMedia>
        <Divider />
        <ListItem style={styles.text}
          disabled={true}
          leftIcon={<UnspentIcon color={budgetStatusColorPalette[1]} />}
          primaryText={unspentAmountString}
          secondaryText={"Unspent"}
        />
        <Divider />
        <ListItem style={styles.text}
          disabled={true}
          leftIcon={<SpentIcon color={budgetStatusColorPalette[0]} />}
          primaryText={spentAmountString}
          secondaryText={correctedUnspentAmount > 0 ? 'Spent' : 'Spent (Overspent)'}
        />
        <Divider />
      </Card>
      <Card style={styles.card}>
        <CardTitle title="Task status" />
        <Divider />
        <CardMedia style={styles.cardMedia}>
          <Doughnut data={createTaskData(items)} />
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
          primaryText={typeof nextIncompletedWorkflow !== "undefined" ? nextIncompletedWorkflow.key : 'None'}
          secondaryText={'Active item '}
        />
        <Divider />
        <Divider />

      </Card>

    </div >


  )
}
export default SubProjectDetails;
