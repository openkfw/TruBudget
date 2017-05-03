import React from 'react';
import {Card} from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import SubProjectsTable from './SubProjectsTable';
import ChangeLog from '../../Notifications/ChangeLog'
import { ACMECorpGrey } from '../../../colors.js'
const SubProjects = ({
  projectName,
  subProjects,
  location,
  history,
  workflowDialogVisible,
  showWorkflowDialog,
  hideWorkflowDialog,
  createSubProjectItem,
  subProjectName,
  storeSubProjectName,
  subProjectAmount,
  storeSubProjectAmount,
  subProjectPurpose,
  storeSubProjectPurpose,
  subProjectCurrency,
  storeSubProjectCurrency,
  showSnackBar,
  storeSnackBarMessage,
  loggedInUser,
  openHistory,
  hideHistory,
  showHistory,
  historyItems,
  users
}) => (
  <Card style={{
    position: 'relative',
    width: '74%'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      alignItems: 'center',
      top: '16px',
      right: '-26px'

    }}>
      <FloatingActionButton  disabled={!loggedInUser.role.write} onTouchTap={showWorkflowDialog} style={{
        position: 'relative'

      }}>
        <ContentAdd/>
      </FloatingActionButton>
      <FloatingActionButton mini={true} onTouchTap={() => openHistory()}  backgroundColor={ACMECorpGrey} style={{
        position: 'relative',
        marginTop: '8px'
      }}>
        <HistoryIcon />
      </FloatingActionButton>

    </div>

    <SubProjectsTable subProjects={subProjects} location={location} history={history} workflowDialogVisible={workflowDialogVisible} showWorkflowDialog={showWorkflowDialog} hideWorkflowDialog={hideWorkflowDialog} createSubProjectItem={createSubProjectItem} subProjectName={subProjectName} storeSubProjectName={storeSubProjectName} subProjectAmount={subProjectAmount} storeSubProjectAmount={storeSubProjectAmount} subProjectPurpose={subProjectPurpose} storeSubProjectPurpose={storeSubProjectPurpose} subProjectCurrency={subProjectCurrency} storeSubProjectCurrency={storeSubProjectCurrency} showSnackBar={showSnackBar} storeSnackBarMessage={storeSnackBarMessage}/>
      <ChangeLog showHistory={showHistory} historyItems={historyItems} users={users} hideHistory={hideHistory}/>
  </Card>

);

export default SubProjects;
