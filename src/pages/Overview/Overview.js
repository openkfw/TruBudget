import React from 'react';

import ProjectCreationDialog from './ProjectCreationDialog';
import OverviewTable from './OverviewTable';

const Overview = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <ProjectCreationDialog title={"Add new project"} {...props} numberOfSteps={4} />
    <OverviewTable {...props} />
  </div>
);

export default Overview;
