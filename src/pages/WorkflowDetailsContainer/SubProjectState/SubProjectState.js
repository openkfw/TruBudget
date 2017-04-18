import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import LinearProgress from 'material-ui/LinearProgress';



const SubProjectState = (props) => (
  <Card style={{
    width: '74%',
    left: '13%',
    right: '13%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <CardHeader
      title={props.location.pathname.substring(9)}
      subtitle="Status: Ongoing"
    >
      <LinearProgress style={{
        width: '20%',
        left: '70%',
        top: '10px',
        position: 'relative',
      }}
        mode="determinate" value={30} />
    </CardHeader>

    <CardText >

    </CardText>
  </Card>

);

export default SubProjectState;
