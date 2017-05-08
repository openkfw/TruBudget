import React from 'react';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';
import { toAmountString, createAmountData, createTaskData, statusIconMapping, statusMapping, tsToString, calculateUnspentAmount, getProgressInformation } from '../../../helper.js'
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

const styles = {
  container: {
    display: 'flex',
    height: '30%',
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxHeight: '500px',
    marginBottom: '32px',
    justifyContent: 'space-between'
  },
  card: {
    width: '31%'
  },
  text: {
    fontSize: '14px'
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
    height: '0px'
  },
  tooltip: {
    top: '12px'
  },
  cardMedia: {
    marginBottom: '10px'
  },
  icon: {
    width: '14px', height: '20px'
  },

}

const ProjectDetails = ({ projectName, projectCurrency, projectAmount, subProjects, projectPurpose, projectStatus, projectTS }) => {
  const amountString = toAmountString(projectAmount, projectCurrency);
  const spentAmount = calculateUnspentAmount(subProjects)
  const unspentAmount = projectAmount - spentAmount;
  const spentAmountString = toAmountString(spentAmount.toString(), projectCurrency);
  const unspentAmountString = toAmountString(unspentAmount.toString(), projectCurrency);
  const statusDetails = getProgressInformation(subProjects)
  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <CardTitle title={projectName} />
        <List>
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<PurposeIcon />}
            primaryText={<div style={styles.purpose}>{projectPurpose} </div>}
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
            leftIcon={statusIconMapping[projectStatus]}
            primaryText={statusMapping[projectStatus]}
            secondaryText={'Status'}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<DateIcon />}
            primaryText={tsToString(projectTS)}
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
          <Doughnut data={createAmountData(projectAmount, subProjects)} />
        </CardMedia>
        <Divider />
        <ListItem style={styles.text}
          disabled={true}
          leftIcon={<UnspentIcon />}
          primaryText={unspentAmountString}
          secondaryText={unspentAmount < 0 ? "Overspent" : "Unspent"}
        />
        <Divider />
        <ListItem style={styles.text}
          disabled={true}
          leftIcon={<SpentIcon />}
          primaryText={spentAmountString}
          secondaryText={'Spent'}

        />
        <Divider />
      </Card>
      <Card style={styles.card}>
        <CardTitle title="Task status" />
        <Divider />
        <CardMedia style={styles.cardMedia}>
          <Doughnut data={createTaskData(subProjects)} />
        </CardMedia>
        <Divider />
        <ListItem disabled={true}>
          <div style={styles.tasksChart}>
            <div style={styles.taskChartItem} >
              <div style={styles.text}>
                {statusDetails.open.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="Open" style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon} >
                  < OpenIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.inProgress.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="In progress" style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon}>
                  < InProgressIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.done.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip="Done" style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon} >
                  < DoneIcon />
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

export default ProjectDetails;
