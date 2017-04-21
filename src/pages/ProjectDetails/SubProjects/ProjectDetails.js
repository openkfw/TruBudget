import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';

const ProjectDetails = ({ name }) => {
  return (
    <Card style={{
      marginBottom: '20px'
    }}>
      <CardTitle title={name} subtitle="Project details" />
      <CardText>
        Lorem Ipsum
      </CardText>
    </Card>
  )
}

export default ProjectDetails;
