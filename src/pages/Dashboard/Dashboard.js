import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';

import NetworkMap from './NetworkMap';

const Dashboard = (props) => (
  <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center' }}>
    <Card style={{
      width: '100%',
      position: 'relative',
    }}>
      <CardTitle title="The Blockchain network dashboard" subtitle="Connected peers in the blockchain network" />
      <CardText>
        The connected blockchain nodes are shown in the map below. You can click on the respective markers to obtain the exact location.
      </CardText>
      <NetworkMap nodeInformation={props.nodeInformation} />
    </Card>
  </div>
)

export default Dashboard;
