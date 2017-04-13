import React from 'react';
import {Card, CardTitle} from 'material-ui/Card';
import { fetchStremItems } from './actions';

import WorkflowTable from './WorkflowTable';

const WorkflowList = ({ streamItems, history, workflowDialogVisible, showWorkflowDialog,hideWorkflowDialog }) => (
      <Card style={{
        width: '74%',
        left: '13%',
        right: '13%',
        top: '300px',
        position: 'absolute',
        zIndex: 1100,

      }}>

        <WorkflowTable streamItems={streamItems} history = {history} workflowDialogVisible={workflowDialogVisible} showWorkflowDialog = {showWorkflowDialog} hideWorkflowDialog = {hideWorkflowDialog}/>
      </Card>

);

export default WorkflowList;
