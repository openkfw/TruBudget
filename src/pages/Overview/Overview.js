import React from 'react';
import {Card, CardTitle, CardText} from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import OverviewTable from './OverviewTable';

const Overview = ({ streams, history }) => (
  <Card style={{
    width: '60%',
    left: '20%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <CardTitle title="Workflows" subtitle="Overview of existing workflows" />
    <CardText>
      All workflows are listed below.
    </CardText>
    <OverviewTable streams={streams} history={history}/>
    <FloatingActionButton secondary style={{
        position: 'absolute',
        right: '-28px',
        top: '16px'
      }}>
      <ContentAdd />
    </FloatingActionButton>
  </Card>
);

export default Overview;
