import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import OverviewTable from './OverviewTable';

const Overview = ({ streams, history, showWorkflowDialog, workflowDialogVisible, hideWorkflowDialog, createProject, storeProjectName, projectName }) => (
  <Card style={{
    width: '60%',
    left: '20%',
    top: '100px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <CardTitle title="Projects" subtitle="Overview of the ongoing projects" />
    <CardText>
      All Projects are listed below.
    </CardText>
    <FloatingActionButton secondary onTouchTap={showWorkflowDialog} style={{
      position: 'absolute',
      right: '-28px',
      top: '16px'
    }}>
      <ContentAdd />
    </FloatingActionButton>
    <OverviewTable streams={streams}
      history={history}
      showWorkflowDialog={showWorkflowDialog}
      workflowDialogVisible={workflowDialogVisible}
      hideWorkflowDialog={hideWorkflowDialog}
      createProject={createProject}
      storeProjectName={storeProjectName}
      projectName={projectName} />
  </Card>
);

export default Overview;
