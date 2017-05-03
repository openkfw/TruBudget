import React from 'react';
import { Card, CardTitle, CardText, CardMedia, CardHeader } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';
import TextField from 'material-ui/TextField';
import { createAmountData, createTaskData } from '../../../helper.js'



const ProjectDetails = ({ projectName, projectAmount, subProjects, projectPurpose }) => {
  return (

    <Card style={{
      width: '74%',
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      <CardTitle title={projectName} subtitle="Project details" />
      <CardText>
        {projectPurpose}
      </CardText>
      <CardText style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around'
      }}>


        <Card style={{ }}>
          <CardHeader
            title="Budget distribution"
            subtitle="Subtitle"
          />
          <CardMedia>
            <Doughnut data={createAmountData(projectAmount, subProjects)} />
          </CardMedia>
          <TextField
            floatingLabelText="Sub-Project budget amount"
            hintText="Budget amount for your project"
            value={projectAmount}
            disabled
          />
        </Card>



        <Card >
          <CardHeader
            title="Task status"
            subtitle="Subtitle"
          />
          <CardMedia>
            <Doughnut data={createTaskData(subProjects)} />
          </CardMedia>
        </Card>
      </CardText>
    </Card>
  )
}

export default ProjectDetails;
