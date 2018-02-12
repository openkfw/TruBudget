import React from 'react';

import ProjectCreationDialog from './ProjectCreationDialog';
import OverviewTable from './OverviewTable';
import strings from '../../localizeStrings'
const Overview = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <ProjectCreationDialog title={strings.project.add_new_project} onDialogCancel={props.onProjectDialogCancel} {...props} numberOfSteps={5} />
    <OverviewTable {...props} />
  </div>
);

export default Overview;
