import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/reorder';
import WorkflowList from './WorkflowList';
import WorkflowCreationDialog from './WorkflowCreationDialog';
import ChangeLog from '../../Notifications/ChangeLog'
import { ACMECorpGrey, ACMECorpDarkBlue } from '../../../colors';
import { getPermissions } from '../../../permissions';
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
        <FloatingActionButton disabled={!allowedToCreateWorkflows} backgroundColor={ACMECorpDarkBlue} onTouchTap={() => props.openWorkflowDialog(false)} style={{
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
      </div>
      <WorkflowList {...props} permissions={{ isAssignee, isApprover, isBank }} />

      <ChangeLog {...props} />
      <WorkflowCreationDialog {...props} />
    </Card>
  )
};

export default Workflow;
