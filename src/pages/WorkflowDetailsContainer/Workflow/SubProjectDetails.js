import React from 'react';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';

import { toAmountString, createAmountData, createTaskData, statusMapping, tsToString, calculateUnspentAmount, getProgressInformation, getNextIncompletedItem } from '../../../helper.js'
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import PurposeIcon from 'material-ui/svg-icons/editor/short-text';
import AmountIcon from 'material-ui/svg-icons/action/account-balance';
import StatusIcon from 'material-ui/svg-icons/action/check-circle';
import UnspentIcon from 'material-ui/svg-icons/content/add-circle';
import SpentIcon from 'material-ui/svg-icons/content/remove-circle';
import DateIcon from 'material-ui/svg-icons/action/date-range';
import ActiveIcon from 'material-ui/svg-icons/image/navigate-next';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InProgressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import IconButton from 'material-ui/IconButton';



const SubProjectDetails = ({ subProjectDetails, workflowItems }) => {
  const name = subProjectDetails.projectName
  const purpose = subProjectDetails.purpose
  const amount = subProjectDetails.amount
  const currency = subProjectDetails.currency
  const amountString = toAmountString(amount, currency)
  const status = statusMapping[subProjectDetails.status]
  const date = tsToString(subProjectDetails.createTS)

  const items = workflowItems.map((item) => ({ ...item, details: item.data }));
  const spentAmount = calculateUnspentAmount(items)
  const unspentAmount = amount - spentAmount;
  const spentAmountString = toAmountString(spentAmount.toString(), currency);
  const unspentAmountString = toAmountString(unspentAmount.toString(), currency);
  const statusDetails = getProgressInformation(items)
  const nextIncompletedWorkflow = getNextIncompletedItem(items)
  return (

    <div style={{
      display: 'flex',
      marginTop: '24px',
      height: '30%',
      flex: 1,
      flexDirection: 'row',
      width: '74%',
      marginBottom: '16px',
      justifyContent: 'space-between'
    }}>

      <Card style={{ width: '31%' }}>
        <CardTitle title={name} />
        <List>
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<PurposeIcon />}
            primaryText={purpose}
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
            leftIcon={<StatusIcon />}
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
      <Card style={{ width: '31%' }}>
        <CardTitle title="Budget distribution" />
        <Divider />
        <CardMedia style={{ marginBottom: '10px' }}>
          <Doughnut data={createAmountData(amount, items)} />
        </CardMedia>
        <Divider />
        <ListItem style={{ fontSize: 14 }}
          disabled={true}
          leftIcon={<UnspentIcon />}
          primaryText={unspentAmountString}
          secondaryText={'Unspent'}
        />
        <Divider />
        <ListItem style={{ fontSize: 14 }}
          disabled={true}
          leftIcon={<SpentIcon />}
          primaryText={spentAmountString}
          secondaryText={'Spent'}
        />
      </Card>
      <Card style={{ width: '31%' }}>
        <CardTitle title="Task status" />
        <Divider />
        <CardMedia style={{ marginBottom: '10px' }}>
          <Doughnut data={createTaskData(items)} />
        </CardMedia>
        <Divider />
        <ListItem disabled={true}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '33%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px' }}>
                {statusDetails.open.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="Open" style={{ padding: '0px', height: '0px' }} tooltipStyles={{ top: '12px' }} iconStyle={{ width: '14px', height: '20px' }} >
                  < OpenIcon />
                </IconButton>
              </div>
            </div>
            <div style={{ width: '33%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px' }}>
                {statusDetails.inProgress.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="In progress" style={{ padding: '0px', height: '0px' }} tooltipStyles={{ top: '12px' }} iconStyle={{ width: '14px', height: '20px' }}>
                  < InProgressIcon />
                </IconButton>
              </div>
            </div>
            <div style={{ width: '33%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px' }}>
                {statusDetails.done.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="Done" style={{ padding: '0px', height: '0px' }} tooltipStyles={{ top: '12px' }} iconStyle={{ width: '14px', height: '20px' }} >
                  < DoneIcon />
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
