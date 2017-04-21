import React from 'react';
import { Card, CardTitle, CardText, CardMedia, CardHeader } from 'material-ui/Card';
import { Doughnut } from 'react-chartjs-2';

const createDoughnutData = (labels, data) => ({
  labels,
  datasets: [
    {
      data: data,
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56"
      ],
      hoverBackgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56"
      ]
    }]
});

const createAmountData = (projectAmount, subProjects) => {
  const subProjectsAmount = subProjects.reduce((acc, subProject) => {
    console.log(subProject.details);
    return acc + parseInt(subProject.details.amount)
  }, 0);

  const unspent = projectAmount - subProjectsAmount;
  return createDoughnutData(["Spent", "Unspent"], [subProjectsAmount, unspent]);
}

const createTaskData = (subProjects) => {
  let startValue = {
    open: 0,
    inProgress: 0,
    done: 0
  }
  const projectStatus = subProjects.reduce((acc, subProject) => {
    const status = subProject.details.status;
    return {
      open: status === 'open' ? acc.open + 1 : acc.open,
      inProgress: status === 'in_progress' ? acc.inProgress + 1 : acc.inProgress,
      done: status === 'done' ? acc.done + 1 : acc.done,
    };
  }, startValue);

  return createDoughnutData(["Open", "In progress", "Done"], [projectStatus.open, projectStatus.inProgress, projectStatus.done]);
}

const ProjectDetails = ({ projectName, projectAmount, subProjects, projectPurpose }) => {
  return (
    <Card style={{
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
        justifyContent: 'center'
      }}>
        <Card>
          <CardHeader
            title="Budget distribution"
            subtitle="Subtitle"
          />
          <CardMedia>
            <Doughnut data={createAmountData(projectAmount, subProjects)} />
          </CardMedia>
        </Card>
        <Card>
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
