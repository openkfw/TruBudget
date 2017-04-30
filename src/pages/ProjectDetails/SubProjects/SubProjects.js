import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import SubProjectsTable from './SubProjectsTable';

const SubProjects = ({ projectName, subProjects, location, history, workflowDialogVisible, showWorkflowDialog, hideWorkflowDialog, createSubProjectItem, subProjectName, storeSubProjectName, subProjectAmount, storeSubProjectAmount,subProjectPurpose, storeSubProjectPurpose,subProjectCurrency,storeSubProjectCurrency, showSnackBar, storeSnackBarMessage, loggedInUser}) => (
  <Card style={{
    position: 'relative'
  }}>
    <SubProjectsTable
      subProjects={subProjects}
      location={location}
      history={history}
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
      subProjectCurrency={subProjectCurrency}
      storeSubProjectCurrency={storeSubProjectCurrency}
      showSnackBar={showSnackBar}
      storeSnackBarMessage={storeSnackBarMessage}
      />
    <FloatingActionButton secondary disabled={!loggedInUser.role.write}  onTouchTap={showWorkflowDialog} style={{
      position: 'absolute',
      right: '-28px',
      top: '16px'
    }}>
      <ContentAdd />
    </FloatingActionButton>
  </Card>
);

export default SubProjects;
