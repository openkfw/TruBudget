import React from 'react';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';
import { toAmountString, createAmountData, createTaskData, statusMapping, tsToString, calculateUnspentAmount, getProgressInformation } from '../../../helper.js'
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import PurposeIcon from 'material-ui/svg-icons/editor/short-text';
import AmountIcon from 'material-ui/svg-icons/action/account-balance';
import StatusIcon from 'material-ui/svg-icons/action/check-circle';
import UnspentIcon from 'material-ui/svg-icons/content/add-circle';
import SpentIcon from 'material-ui/svg-icons/content/remove-circle';
import DateIcon from 'material-ui/svg-icons/action/date-range';


const ProjectDetails = ({ projectName, projectCurrency, projectAmount, subProjects, projectPurpose, projectStatus, projectTS }) => {
  const amountString = toAmountString(projectAmount, projectCurrency);
  const spentAmount = calculateUnspentAmount(subProjects)
  const unspentAmount = projectAmount - spentAmount;
  const spentAmountString = toAmountString(spentAmount.toString(), projectCurrency);
  const unspentAmountString = toAmountString(unspentAmount.toString(), projectCurrency);
  const statusDetails = getProgressInformation(subProjects)
  return (
    <div style={{
      display: 'flex',
      marginTop: '20px',
      height: '30%',
      flex: 1,
      flexDirection: 'row',
      width: '74%',
      maxHeight: '500px',
      marginBottom: '20px',
      justifyContent: 'space-between'
    }}>

      <Card style={{ width: '28%' }}>
        <CardTitle title={projectName} />
        <List>
          <Divider />
          <ListItem
            disabled={true}
            leftIcon={<PurposeIcon />}
            primaryText={projectPurpose}
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
      <Card style={{ width: '28%' }}>
        <CardTitle title="Budget distribution" />
        <Divider />
        <CardMedia style={{ marginBottom: '10px' }}>
          <Doughnut data={createAmountData(projectAmount, subProjects)} />
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
      <Card style={{ width: '28%' }}>
        <CardTitle title="Task status" />
        <Divider />
        <CardMedia style={{ marginBottom: '10px' }}>
          <Doughnut data={createTaskData(subProjects)} />
        </CardMedia>
        <Divider />
        <ListItem style={{ fontSize: 14 }}
          disabled={true}
          leftIcon={<UnspentIcon />}
          primaryText={statusDetails.open.toString()}
          secondaryText={'Open'}
        />
        <Divider />
        <ListItem style={{ fontSize: 14 }}
          disabled={true}
          leftIcon={<UnspentIcon />}
          primaryText={statusDetails.inProgress.toString()}
          secondaryText={'In Progress'}
        />
        <Divider />
        <ListItem style={{ fontSize: 14 }}
          disabled={true}
          leftIcon={<UnspentIcon />}
          primaryText={statusDetails.done.toString()}
          secondaryText={'Done'}
        />
        <Divider />

      </Card>

    </div>
  )
}

export default ProjectDetails;
