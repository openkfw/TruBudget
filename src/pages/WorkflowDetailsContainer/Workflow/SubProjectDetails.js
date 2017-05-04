import React from 'react';
import { Card, CardTitle, CardText, CardMedia, CardHeader } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';
import TextField from 'material-ui/TextField';
import { tsToString, createAmountData, createTaskData } from '../../../helper.js'






const SubProjectDetails = ({ subProjectDetails, workflowItems }) => {
  const dateString = tsToString(subProjectDetails.createTS);
  const items = workflowItems.map((item) => ({ ...item, details: item.data }));
  return (

    <Card style={{
      width: '74%',
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      <CardTitle title={subProjectDetails.projectName} subtitle="Sub project details" />
      <CardText>
        {subProjectDetails.purpose}
      </CardText>
      <CardText>
        {dateString}
      </CardText>

      <CardText style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around'
      }}>
        <Card style={{}}>
          <CardHeader title="Budget distribution" subtitle="Subtitle" />
          <CardMedia>
            <Doughnut data={createAmountData(subProjectDetails.amount, items)} />
          </CardMedia>
          <TextField floatingLabelText="Sub-Project budget amount" hintText="Budget amount for your project" value={subProjectDetails.amount} disabled />
        </Card>
        <Card >
          <CardHeader
            title="Task status"
            subtitle="Subtitle"
          />
          <CardMedia>
            <Doughnut data={createTaskData(items)} />
          </CardMedia>
        </Card>


      </CardText>
    </Card>
  )
}

export default SubProjectDetails;
