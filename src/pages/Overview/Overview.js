import React from 'react';



import OverviewTable from './OverviewTable';
import ProjectCreation from './ProjectCreation';
const Overview = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <ProjectCreation {...props} />
  </div >
);

export default Overview;
