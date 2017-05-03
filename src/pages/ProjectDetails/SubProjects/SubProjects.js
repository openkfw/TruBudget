import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import SubProjectsTable from './SubProjectsTable';
import ChangeLog from '../../Notifications/ChangeLog'

const SubProjects = ({ projectName, subProjects, location, history, workflowDialogVisible, showWorkflowDialog, hideWorkflowDialog, createSubProjectItem, subProjectName, storeSubProjectName, subProjectAmount, storeSubProjectAmount,subProjectPurpose, storeSubProjectPurpose,subProjectCurrency,storeSubProjectCurrency, showSnackBar, storeSnackBarMessage, loggedInUser, openHistory, hideHistory, showHistory, historyItems, users}) => (
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

    <FloatingActionButton  mini={true} onTouchTap={() => openHistory()} default style={{
      position: 'absolute',
      right: '-15px',
      top: '80px'
    }}>
      <HistoryIcon />
    </FloatingActionButton>
    <ChangeLog showHistory={showHistory} historyItems={historyItems} users={users} hideHistory={hideHistory}/>
  </Card>

);

export default SubProjects;
