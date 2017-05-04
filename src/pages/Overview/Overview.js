import React from 'react';

import OverviewTable from './OverviewTable';

const Overview = ({ projects, history, showWorkflowDialog, workflowDialogVisible, hideWorkflowDialog, createProject, storeProjectName, projectName, storeProjectAmount,
  projectAmount, projectPurpose, storeProjectPurpose, storeProjectCurrency, projectCurrency, openSnackBar, storeSnackBarMessage, loggedInUser }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
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
        storeSnackBarMessage={storeSnackBarMessage}
        loggedInUser={loggedInUser} />

    </div>
  );

export default Overview;
