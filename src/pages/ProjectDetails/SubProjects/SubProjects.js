import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/history';

import SubProjectsTable from './SubProjectsTable';
import ChangeLog from '../../Notifications/ChangeLog';
import ProjectCreationDialog from '../../Overview/ProjectCreationDialog';
import { ACMECorpGrey } from '../../../colors.js';

// const exprops = {
//   projectName,
//   subProjects,
//   location,
//   history,
//   workflowDialogVisible,
//   showWorkflowDialog,
//   hideWorkflowDialog,
//   createSubProjectItem,
//   subProjectName,
//   storeSubProjectName,
//   subProjectAmount,
//   storeSubProjectAmount,
//   subProjectPurpose,
//   storeSubProjectPurpose,
//   subProjectCurrency,
//   storeSubProjectCurrency,
//   showSnackBar,
//   storeSnackBarMessage,
//   loggedInUser,
//   openHistory,
//   hideHistory,
//   showHistory,
//   historyItems,
//   users
// }


const SubProjects = (props) => (
  <Card style={{
    position: 'relative',
    width: '74%'
  }}>
    <ProjectCreationDialog
      {...props}
      title="Add new Sub-project"
      createProject={props.createSubProjectItem}
      creationDialogShown={props.workflowDialogVisible}
      projectName={props.subProjectName}
      storeProjectName={props.storeSubProjectName}
      projectAmount={props.subProjectAmount}
      storeProjectAmount={props.storeSubProjectAmount}
      projectPurpose={props.subProjectPurpose}
      storeProjectPurpose={props.storeSubProjectPurpose}
      projectCurrency={props.subProjectCurrency}
      storeProjectCurrency={props.storeSubProjectCurrency}
    />
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      alignItems: 'center',
      top: '16px',
      right: '-26px'

    }}>
      <FloatingActionButton disabled={!props.loggedInUser.role.write} onTouchTap={props.showWorkflowDialog} style={{
        position: 'relative'

      }}>
        <ContentAdd />
      </FloatingActionButton>
      <FloatingActionButton mini={true} onTouchTap={() => props.openHistory()} backgroundColor={ACMECorpGrey} style={{
        position: 'relative',
        marginTop: '8px'
      }}>
        <HistoryIcon />
      </FloatingActionButton>

    </div>

    <SubProjectsTable {...props} />
    <ChangeLog {...props} />
  </Card>

);

export default SubProjects;
