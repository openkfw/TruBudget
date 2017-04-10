import React from 'react';
import {Card, CardTitle, CardText} from 'material-ui/Card';

import OverviewTable from './OverviewTable';

const Overview = ({ streams }) => (
  <Card style={{
    width: '60%',
    left: '20%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,

  }}>
    <CardTitle title="Streams" subtitle="Overview of existing workflows" />
    <CardText>
      All workflows are listed below.
    </CardText>
    <OverviewTable streams={streams}/>
  </Card>
);

export default Overview;
