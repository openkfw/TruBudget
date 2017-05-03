import React from 'react';
import { Card } from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import WorkflowList from'./WorkflowList';
import WorkflowCreationDialog from './WorkflowCreationDialog';
import ChangeLog from '../../Notifications/ChangeLog'

const Workflow = (props) => (
  <Card style={{
    width: '74%',
    left: '13%',
    right: '13%',
    top: '300px',
    position: 'absolute',
    zIndex: 1100,
  }}>
    <WorkflowList
      {...props}
      />
    <FloatingActionButton  disabled={!props.loggedInUser.role.write} onTouchTap={() => props.openWorkflowDialog(false)} secondary style={{
      position: 'absolute',
      right: '-28px',
      top: '16px'
    }}>
      <ContentAdd />
    </FloatingActionButton>
    <FloatingActionButton  mini={true} onTouchTap={() => props.openHistory()} default style={{
      position: 'absolute',
      right: '-15px',
      top: '80px'
    }}>
      <HistoryIcon />
    </FloatingActionButton>
    <ChangeLog {...props}/>
    <WorkflowCreationDialog {...props} />
  </Card>
);

export default Workflow;
