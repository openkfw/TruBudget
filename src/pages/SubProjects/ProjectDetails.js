import React from 'react';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';
import { toAmountString, getAllocationRatio, getCompletionRatio, getCompletionString, createAmountData, createTaskData, statusIconMapping, statusMapping, tsToString, calculateUnspentAmount, getProgressInformation, getAssignedOrganization } from '../../helper.js'
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import CommentIcon from 'material-ui/svg-icons/editor/short-text';
import AmountIcon from 'material-ui/svg-icons/action/account-balance';
import UnspentIcon from 'material-ui/svg-icons/content/add-circle';
import DateIcon from 'material-ui/svg-icons/action/date-range';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InProgressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import AssigneeIcon from 'material-ui/svg-icons/social/group';
import IconButton from 'material-ui/IconButton';
import CompletionIcon from 'material-ui/svg-icons/action/trending-up'

import GaugeChart from '../Common/GaugeChart';
import { budgetStatusColorPalette, red } from '../../colors'
import strings from '../../localizeStrings'

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
  comment: {
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
    width: '16px', height: '20px'
  },
  overspent: {
    color: red
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

const ProjectDetails = ({ projectName, projectCurrency, projectAmount, subProjects, projectComment, projectStatus, projectTS, projectAssignee }) => {
  const amountString = toAmountString(projectAmount, projectCurrency);
  const spentAmount = calculateUnspentAmount(subProjects)

  const completionRatio = getCompletionRatio(subProjects);
  const completionString = getCompletionString(subProjects);


  const unspentAmount = projectAmount - spentAmount;
  const correctedUnspentAmount = unspentAmount > 0 ? unspentAmount : 0

  const spentAmountString = toAmountString(spentAmount.toString(), projectCurrency);
  const unspentAmountString = toAmountString(correctedUnspentAmount.toString(), projectCurrency);
  const statusDetails = getProgressInformation(subProjects)

  const allocatedRatio = getAllocationRatio(spentAmount, projectAmount);

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <CardTitle title={projectName} />
        <List>
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<CommentIcon />}
            primaryText={<div style={styles.comment}>{projectComment} </div>}
            secondaryText={strings.common.comment}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<AmountIcon />}
            primaryText={amountString}
            secondaryText={strings.common.budget}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={statusIconMapping[projectStatus]}
            primaryText={statusMapping(projectStatus)}
            secondaryText={strings.common.status}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<DateIcon />}
            primaryText={tsToString(projectTS)}
            secondaryText={strings.common.created}
          />
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<AssigneeIcon />}
            primaryText={getAssignedOrganization(projectAssignee)}
            secondaryText={strings.subproject.subproject_assigned_organization}
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
            leftIcon={<UnspentIcon color={budgetStatusColorPalette[1]} />}
            primaryText={spentAmountString}
            secondaryText={strings.common.assigned_budget}
          />
          <GaugeChart size={0.20} responsive={false} value={allocatedRatio} />
        </div>

        <Divider />
        <div style={styles.charts}>
          <ListItem style={styles.text}
            disabled={true}
            leftIcon={<CompletionIcon color={budgetStatusColorPalette[1]} />}
            primaryText={completionString}
            secondaryText={strings.common.completion}
          />
          <GaugeChart size={0.20} responsive={false} value={completionRatio} />
        </div>
        <Divider />
      </Card>
      <Card style={styles.card}>
        <CardTitle title={strings.common.task_status} />
        <Divider />
        <CardMedia style={styles.cardMedia}>
          <Doughnut data={createTaskData(subProjects, 'subprojects')} />
        </CardMedia>
        <Divider />
        <ListItem disabled={true}>
          <div style={styles.tasksChart}>
            <div style={styles.taskChartItem} >
              <div style={styles.text}>
                {statusDetails.open.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip={strings.common.open} style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon} >
                  < OpenIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.inProgress.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip={strings.common.in_progress} style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon}>
                  < InProgressIcon />
                </IconButton>
              </div>
            </div>
            <div style={styles.taskChartItem}>
              <div style={styles.text}>
                {statusDetails.done.toString()}
              </div>
              <div>
                <IconButton disableTouchRipple tooltip={strings.common.done} style={styles.iconButton} tooltipStyles={styles.tooltip} iconStyle={styles.icon} >
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
