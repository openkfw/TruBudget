import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/reorder';
import EditIcon from 'material-ui/svg-icons/image/edit';
import WorkflowListContainer from './WorkflowListContainer';
import WorkflowCreationDialog from './WorkflowCreationDialog';
import ChangeLog from '../Notifications/ChangeLog'
import { ACMECorpGrey, ACMECorpDarkBlue } from '../../colors.js'
import DoneIcon from 'material-ui/svg-icons/navigation/check';

const enableWorkflowSort = (props) => (
  <IconButton mini={true} onTouchTap={() => props.enableWorkflowSort()} backgroundColor={ACMECorpDarkBlue} style={{
    position: 'relative',
    marginTop: '8px',
    zIndex: 2
  }}>
    <EditIcon color={ACMECorpDarkBlue} />
  </IconButton>
)

const disableWorkflowSort = (props) => (
  <FloatingActionButton mini={true} onTouchTap={() => props.disableWorkflowSort()} style={{
    position: 'relative',
    marginTop: '8px',
    zIndex: 2
  }}>
    <DoneIcon />
  </FloatingActionButton>
)

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
      <FloatingActionButton disabled={!props.loggedInUser.role.write && props.workflowSortEnabled} backgroundColor={ACMECorpDarkBlue} onTouchTap={() => props.openWorkflowDialog(false)} style={{
        position: 'relative'
      }}>
        <ContentAdd />
      </FloatingActionButton>
      <FloatingActionButton mini={true} disabled={props.workflowSortEnabled} onTouchTap={() => props.openHistory()} backgroundColor={ACMECorpGrey} style={{
        position: 'relative',
        marginTop: '8px',
        zIndex: 2
      }}>
        <HistoryIcon />
      </FloatingActionButton>

    </div>
    <div style={{
      display: 'flex',
      position: 'absolute',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      top: '46px',
      left: '10px',
      zIndex: 10
    }}>
      {!props.workflowSortEnabled ? enableWorkflowSort(props) : disableWorkflowSort(props)}
    </div>
    <WorkflowListContainer {...props} />
    <ChangeLog {...props} />
    <WorkflowCreationDialog {...props} />
  </Card>
);

export default Workflow;
