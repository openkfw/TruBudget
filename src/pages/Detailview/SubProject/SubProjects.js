import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import SubProjectsTable from './SubProjectsTable';

const SubProjects = ({ streamItems, location, workflowDialogVisible, showWorkflowDialog, hideWorkflowDialog, createSubProjectItem, subProjectName, storeSubProjectName, subProjectAmount, storeSubProjectAmount,subProjectPurpose, storeSubProjectPurpose}) => (
  <Card style={{
    width: '74%',
    left: '13%',
    right: '13%',
    top: '300px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <SubProjectsTable streamItems={streamItems}
      location={location}
      workflowDialogVisible={workflowDialogVisible}
      showWorkflowDialog={showWorkflowDialog}
      hideWorkflowDialog={hideWorkflowDialog}
      createSubProjectItem={createSubProjectItem}
      subProjectName={subProjectName}
      storeSubProjectName={storeSubProjectName}
      subProjectAmount={subProjectAmount}
      storeSubProjectAmount={storeSubProjectAmount}
      subProjectPurpose={subProjectPurpose}
      storeSubProjectPurpose={storeSubProjectPurpose}
      />
    <FloatingActionButton secondary onTouchTap={showWorkflowDialog} style={{
      position: 'absolute',
      right: '-28px',
      top: '16px'
    }}>
      <ContentAdd />
    </FloatingActionButton>
  </Card>
);

export default SubProjects;
