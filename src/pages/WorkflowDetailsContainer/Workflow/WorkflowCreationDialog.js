import React from 'react';



import Dialog from 'material-ui/Dialog';
import {Tabs, Tab} from 'material-ui/Tabs';
import FlatButton from 'material-ui/FlatButton';

import WorkflowBudgetAllocation from './WorkflowBudgetAllocation'
const styles = {
  headline: {

  },
  slide: {
    padding: 10,
  },
};
function handleActive(tab) {
  alert(`A tab with this route property ${tab.props['data-route']} was activated.`);
}

const buttons = (hideWorkflowDialog) =>(
  <div>
  <FlatButton label='Back'  onTouchTap={hideWorkflowDialog} style={{right:'81%'
  }}/>
  <FlatButton label='Create' onTouchTap={hideWorkflowDialog} style={{right:'3%'

  }}/>
  </div>
);

const WorkflowCreationDialog = ({showWorkflow, openWorkflowDialog, hideWorkflowDialog}) => (

    <Dialog
         title="Create Workflow Item"
         modal={false}
         actions = {buttons(hideWorkflowDialog)}
         contentStyle={{  width: '75%',maxWidth:'none'
           }}
         open={showWorkflow}
         onRequestClose={hideWorkflowDialog}
       >
       <Tabs>
     <Tab label="Budget allocation" >
       <WorkflowBudgetAllocation title='Budget Allocation'/>
     </Tab>
     <Tab label="Activity" >
       <div>
           <WorkflowBudgetAllocation title='Activity'/>
       </div>
     </Tab>
     <Tab label="Tender">
       <div>
         <h2 style={styles.headline}>Tender</h2>

       </div>
     </Tab>
     <Tab label="Contract">
       <div>
         <h2 style={styles.headline}>Contract</h2>

       </div>
     </Tab>
     <Tab
       label="Monitoring">
       <div>
         <h2 style={styles.headline}>Monitoring</h2>

       </div>
     </Tab>
     <Tab
       label="Payments">
       <div>
         <h2 style={styles.headline}>Payments</h2>

       </div>
     </Tab>
   </Tabs>
       </Dialog>

);

export default WorkflowCreationDialog;
