import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import OverviewTable from './OverviewTable';

const Overview = ({ projects, history, showWorkflowDialog, workflowDialogVisible, hideWorkflowDialog, createProject, storeProjectName, projectName, storeProjectAmount,
  projectAmount, projectPurpose, storeProjectPurpose, storeProjectCurrency, projectCurrency, openSnackBar, storeSnackBarMessage, loggedInUser }) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems:'center'}}>
    <Card style={{
      width: '60%',
      position: 'relative',
      marginTop: '40px'
    }}>
    <FloatingActionButton primary disabled={!loggedInUser.role.write} onTouchTap={showWorkflowDialog}  style={{position: 'absolute', right: '-26px', top: '16px'}}>
        <ContentAdd />
    </FloatingActionButton>
      <CardTitle title="Projects" subtitle="Overview of ongoing projects" />
      <CardText>
        The list of currently ongoing projects is shown below. Click on the select link to view additional details.
    </CardText>
      <OverviewTable
        projects={projects}
        history={history}
        showWorkflowDialog={showWorkflowDialog}
        workflowDialogVisible={workflowDialogVisible}
        hideWorkflowDialog={hideWorkflowDialog}
        createProject={createProject}
        storeProjectName={storeProjectName}
        projectName={projectName}
        storeProjectAmount={storeProjectAmount}
        projectAmount={projectAmount}
        projectPurpose={projectPurpose}
        storeProjectPurpose={storeProjectPurpose}
        storeProjectCurrency={storeProjectCurrency}
        projectCurrency={projectCurrency}
        openSnackBar={openSnackBar}
        storeSnackBarMessage={storeSnackBarMessage} />

    </Card>
    </div>
  );

export default Overview;
