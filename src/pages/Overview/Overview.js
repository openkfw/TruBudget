import React from 'react';

import OverviewTable from './OverviewTable';
import ProjectCreation from './ProjectCreation';

const Overview = (props) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ProjectCreation {...props} />
      <OverviewTable {...props} />
    </div>
  )
};

export default Overview;
