import React from 'react';

import OverviewTable from './OverviewTable';
import ProjectCreation from './ProjectCreation';
import withInitialLoading from '../Loading/withInitialLoading';

const Overview = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <ProjectCreation {...props} />
    <OverviewTable {...props} />
  </div>
);

export default withInitialLoading(Overview);
