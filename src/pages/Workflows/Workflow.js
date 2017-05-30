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
import { getPermissions } from '../../permissions';

const enableWorkflowSort = (props, allowedToCreateWorkflows) => (
  <IconButton disabled={!allowedToCreateWorkflows} mini={true} onTouchTap={() => props.enableWorkflowSort()} backgroundColor={ACMECorpDarkBlue} style={{
    position: 'relative',
    marginTop: '8px',
    zIndex: 2
  }}>
    <EditIcon color={ACMECorpDarkBlue} />
  </IconButton>
)

const disableWorkflowSort = (props, allowedToCreateWorkflows) => (
  <FloatingActionButton disabled={!allowedToCreateWorkflows} mini={true} onTouchTap={() => props.disableWorkflowSort()} style={{
    position: 'relative',
    marginTop: '8px',
    zIndex: 2
  }}>
    <DoneIcon />
  </FloatingActionButton>
)

const Workflow = (props) => {

  const { isAssignee, isApprover, isBank } = getPermissions(props.loggedInUser, props.subProjectDetails);
  const allowedToWrite = props.loggedInUser.role.write;
  const allowedToCreateWorkflows = allowedToWrite && isAssignee;

  return (
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
        {/* Button is disabled either if the user is not allowed to edit or the user is in "sort" mode */}
        <FloatingActionButton disabled={props.workflowSortEnabled ? props.workflowSortEnabled : !allowedToCreateWorkflows} backgroundColor={ACMECorpDarkBlue} onTouchTap={() => props.openWorkflowDialog(false)} style={{
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
        {!props.workflowSortEnabled ? enableWorkflowSort(props, allowedToCreateWorkflows) : disableWorkflowSort(props, allowedToCreateWorkflows)}
      </div>
      <WorkflowListContainer {...props} permissions={{ isAssignee, isApprover, isBank }} />
      <ChangeLog {...props} />
      <WorkflowCreationDialog {...props} />
    </Card >
  )
};

export default Workflow;
