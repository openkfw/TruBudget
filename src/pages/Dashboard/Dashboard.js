import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';

import NetworkMap from './NetworkMap';

const Dashboard = (props) => (
  <Card style={{
    width: '80%',
    left: '10%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <CardTitle title="The Blockchain network dashboard" subtitle="Connected peers in the blockchain network" />
    <CardText>
      The connected blockchain nodes are shown in the map below. You can click on the respective markers to obtain the exact location.
    </CardText>
    <NetworkMap nodeInformation={props.nodeInformation} />
  </Card>
)

export default Dashboard;
