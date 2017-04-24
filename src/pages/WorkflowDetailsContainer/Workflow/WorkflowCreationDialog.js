import React from 'react';
import Dialog from 'material-ui/Dialog';
import WorkflowCreationStepper from './WorkflowCreationStepper'


const WorkflowCreationDialog = (props) => (

    <Dialog
         title="Create Workflow Item"
         modal={true}
         style={{width: '95%'}}
         open={props.showWorkflow}
         onRequestClose={props.hideWorkflowDialog}
         editMode={props.editMode}
       >
         <WorkflowCreationStepper {...props}/>
       </Dialog>

);

export default WorkflowCreationDialog;
