import React from 'react';

import ProjectDialog from '../Common/ProjectDialog';
import OverviewTable from './OverviewTable';
import strings from '../../localizeStrings'
const Overview = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <ProjectDialog title={strings.project.add_new_project} hideDialog={props.hideProjectDialog} {...props} numberOfSteps={2} />
    <OverviewTable {...props} />
  </div>
);

export default Overview;
