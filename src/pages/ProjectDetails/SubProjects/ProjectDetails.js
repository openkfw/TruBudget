import React from 'react';
import { Card, CardTitle, CardText, CardMedia, CardHeader } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';
import TextField from 'material-ui/TextField';
import { toAmountString, createAmountData, createTaskData, statusMapping } from '../../../helper.js'
import { List, ListItem} from 'material-ui/List';

import PurposeIcon from 'material-ui/svg-icons/editor/short-text';
import AmountIcon from 'material-ui/svg-icons/action/account-balance';
import StatusIcon from 'material-ui/svg-icons/action/check-circle';
import InfoIcon from 'material-ui/svg-icons/content/create';


const ProjectDetails = ({ projectName, projectCurrency,  projectAmount, subProjects, projectPurpose, projectStatus }) => {
  const amountString = toAmountString(projectAmount, projectCurrency)
  console.log(statusMapping)
  return (
    <div style={{ display: 'flex',
          marginTop: '20px',
          height: '30%',
        flex: 1,
        flexDirection: 'row',
        width: '74%',
        marginBottom: '20px',
        justifyContent: 'space-between'}}>

      <Card style={{width: '30%'}}>
      <CardTitle title={projectName} subtitle="Project details" />
      <List>
          <ListItem
            disabled={true}
            leftIcon={<PurposeIcon />}
            secondaryText={projectPurpose}
          />
          <ListItem
            disabled={true}
            leftIcon={<AmountIcon />}
            secondaryText={amountString}
          />

          <ListItem
            disabled={true}
            leftIcon={<StatusIcon />}
            primaryText={statusMapping[projectStatus]}
          />

        </List>
      <CardText style={{
      }}>
       </CardText>
       </Card>
        <Card style={{width: '30%'}}>
          <CardMedia>
            <img src='./school.jpg' alt='projectType' />
          </CardMedia>
          <CardHeader
            title="Budget distribution"
            subtitle={amountString}
          />
          <CardMedia>
            <Doughnut data={createAmountData(projectAmount, subProjects)} />
          </CardMedia>
        </Card>
        <Card style={{width: '30%'}}>
          <CardHeader
            title="Task status"
            subtitle="Subtitle"
          />
          <CardMedia>
            <Doughnut data={createTaskData(subProjects)} />
          </CardMedia>
        </Card>
     
      </div>
  )
}

export default ProjectDetails;
