import React from 'react';
import Dialog from 'material-ui/Dialog';

import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import { toAmountString, statusMapping } from '../../helper';
import Avatar from 'material-ui/Avatar';
import { ListItem } from 'material-ui/List';

import DocumentOverview from '../Documents/DocumentOverview';

const styles = {
  textfield: {
    right: -30
  },
  closeButton: {
    left: 650,
    position: 'absolute',
    top: 20
  },
  avatarCard: {
    width: '45%',
    left: '35px'
  },
  dialog: {
    width: '95%'
  },
  paper: {
    width: '70%',
    marginTop: '10px'
  }
};

const getWorkflowItem = (workflowItems, showWorkflowDetails, showDetailsItemId) => {
  let workflowItem = {
    key: '',
    data: []
  }

  if (showWorkflowDetails) {
    workflowItem = workflowItems.find((workflow) => workflow.txid === showDetailsItemId);
  }

  return workflowItem;
}
const getUser = (userId, users, showWorkflowDetails) => {
  let userProps = {}

  if (showWorkflowDetails) {
    userProps = users[userId];
  }

  return userProps;
}

const WorkflowDetails = ({ workflowItems, showWorkflowDetails, showDetailsItemId, hideWorkflowDetails, users, validateDocument, validatedDocuments }) => {
  const actions = [
    <FlatButton label="Close"
      onTouchTap={hideWorkflowDetails}
    />];

  const workflowItem = getWorkflowItem(workflowItems, showWorkflowDetails, showDetailsItemId);
  const assignedUser = getUser(workflowItem.data.assignee, users, showWorkflowDetails);
  return (

    <Dialog open={showWorkflowDetails} actions={actions} title={workflowItem.key} modal={false} style={styles.dialog}>
      <div>
        Amount:
        <TextField disabled={true} hintText={toAmountString(workflowItem.data.amount, workflowItem.data.currency)} style={styles.textfield} underlineShow={false} />
        <Divider />
        Purpose:
        <TextField disabled={true} hintText={workflowItem.data.purpose} style={styles.textfield} underlineShow={false} />
        <Divider />
        Documents:
        <DocumentOverview documents={workflowItem.data.documents} validateDocument={validateDocument} validatedDocuments={validatedDocuments} />
        <Divider />
        Status:
        <TextField disabled={true} hintText={statusMapping[workflowItem.data.status]} style={styles.textfield} underlineShow={false} />
        <Divider />
        <div style={styles.paper}>
          Assignee:
          <ListItem primaryText={assignedUser.name} disabled={true} secondaryText={assignedUser.organization} leftAvatar={< Avatar src={
            assignedUser.avatar
          } />} />
        </div>

      </div>
    </Dialog>
  )
};

export default WorkflowDetails;
