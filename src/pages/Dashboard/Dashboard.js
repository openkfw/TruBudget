import React from 'react';
import {Card, CardTitle, CardText} from 'material-ui/Card';

import NetworkMap from './NetworkMap';

const Dashboard = (props) => (
  <Card style={{
    width: '60%',
    left: '20%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <CardTitle title="Network" subtitle="Connected Peers in the Network" />
    <CardText>
      All Projects are listed below.
    </CardText>
    <NetworkMap nodeInformation={props.nodeInformation} />
  </Card>
)

export default Dashboard;
