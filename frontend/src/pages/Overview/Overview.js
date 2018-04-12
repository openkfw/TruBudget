import React from 'react';

import OverviewTable from './OverviewTable';
import ProjectCreation from './ProjectCreation';
//import PermissionsScreen from '../Common/Permissions/PermissionsScreen';

const Overview = (props) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ProjectCreation {...props} />
      <OverviewTable {...props} />
    </div>
  )
};

export default Overview;
