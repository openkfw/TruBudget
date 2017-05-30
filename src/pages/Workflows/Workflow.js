import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/reorder';
import EditIcon from 'material-ui/svg-icons/image/edit';
import WorkflowList from './WorkflowList';
import WorkflowCreationDialog from './WorkflowCreationDialog';
import ChangeLog from '../Notifications/ChangeLog'
import { ACMECorpGrey, ACMECorpDarkBlue } from '../../colors.js'
import DoneIcon from 'material-ui/svg-icons/navigation/check';

const Workflow = (props) => (

  <Card style={{
    width: '100%',
    position: 'relative'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      alignItems: 'center',
      top: '16px',
      right: '-26px',
      zIndex: 10
    }}>
      <FloatingActionButton disabled={!props.loggedInUser.role.write} backgroundColor={ACMECorpDarkBlue} onTouchTap={() => props.openWorkflowDialog(false)} style={{
        position: 'relative'
      }}>
        <ContentAdd />
      </FloatingActionButton>
      <FloatingActionButton mini={true} onTouchTap={() => props.openHistory()} backgroundColor={ACMECorpGrey} style={{
        position: 'relative',
        marginTop: '8px',
        zIndex: 2
      }}>
        <HistoryIcon />
      </FloatingActionButton>
      {!props.workflowSortEnabled ? enableWorkflowSort(props) : disableWorkflowSort(props)}
    </div>
    <WorkflowList {...props} />

    <ChangeLog {...props} />
    <WorkflowCreationDialog {...props} />
  </Card>
);


const enableWorkflowSort = (props) => (
  <FloatingActionButton mini={true} onTouchTap={() => props.enableWorkflowSort()} backgroundColor={ACMECorpGrey} style={{
    position: 'relative',
    marginTop: '8px',
    zIndex: 2
  }}>
    <EditIcon />
  </FloatingActionButton>
)

const disableWorkflowSort = (props) => (
  <FloatingActionButton mini={true} onTouchTap={() => props.disableWorkflowSort()} backgroundColor={ACMECorpGrey} style={{
    position: 'relative',
    marginTop: '8px',
    zIndex: 2
  }}>
    <DoneIcon />
  </FloatingActionButton>
)


export default Workflow;
