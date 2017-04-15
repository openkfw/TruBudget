import React from 'react';
import {Card, CardTitle} from 'material-ui/Card';
import { fetchStremItems } from './actions';

import WorkflowTable from './WorkflowTable';

const WorkflowList = ({ streamItems, location, workflowDialogVisible, showWorkflowDialog,hideWorkflowDialog,createSubProjectItem,streamName, storeStreamName }) => (
      <Card style={{
        width: '74%',
        left: '13%',
        right: '13%',
        top: '300px',
        position: 'absolute',
        zIndex: 1100,
      }}>

        <WorkflowTable streamItems={streamItems}
        location = {location}
        workflowDialogVisible={workflowDialogVisible}
        showWorkflowDialog = {showWorkflowDialog}
        hideWorkflowDialog = {hideWorkflowDialog}
         createSubProjectItem = {createSubProjectItem}
         streamName ={streamName}
         storeStreamName = {storeStreamName}/>
      </Card>

);

export default WorkflowList;
