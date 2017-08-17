import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';

import NetworkMap from './NetworkMap';
import strings from '../../localizeStrings'
const Dashboard = (props) => (
  <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center' }}>
    <Card style={{
      width: '100%',
      position: 'relative',
    }}>
      <CardTitle title={strings.dashboard.dashboard_title} subtitle={strings.dashboard.dashboard_subtitle} />
      <CardText>
        {strings.dashboard.dashboard_card_text}
      </CardText>
      <NetworkMap nodeInformation={props.nodeInformation} />
    </Card>
  </div>
)

export default Dashboard;
