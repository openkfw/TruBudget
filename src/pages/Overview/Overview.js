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
    <CardTitle title="Streams" subtitle="Overview of existing streams" />
    <CardText>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
      Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
      Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
    </CardText>
    <OverviewTable streams={streams}/>
  </Card>
);

export default Overview;