import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import WorkflowTable from './WorkflowTable';

const WorkflowList = ({ streamItems, location, workflowDialogVisible, showWorkflowDialog, hideWorkflowDialog, createSubProjectItem, streamName, storeStreamName }) => (
  <Card style={{
    width: '74%',
    left: '13%',
    right: '13%',
    top: '300px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <WorkflowTable streamItems={streamItems}
      location={location}
      workflowDialogVisible={workflowDialogVisible}
      showWorkflowDialog={showWorkflowDialog}
      hideWorkflowDialog={hideWorkflowDialog}
      createSubProjectItem={createSubProjectItem}
      streamName={streamName}
      storeStreamName={storeStreamName} />
    <FloatingActionButton secondary onTouchTap={showWorkflowDialog} style={{
      position: 'absolute',
      right: '-28px',
      top: '16px'
    }}>
      <ContentAdd />
    </FloatingActionButton>
  </Card>
);

export default WorkflowList;
