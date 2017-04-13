import React from 'react';
import {Step, Stepper, StepLabel} from 'material-ui/Stepper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Origin from '../../WorkflowCreation/Origin'

const getStepContent = (stepIndex) => {

  switch (stepIndex){
   case 1:
      return <Origin/>

  }

}
const WorkFlowStepper = ({showWorkflowDialog, hideWorkflowDialog, streamItems, workflowDialogVisible}) => {



  <div>
          <Stepper activeStep={1}>
            <Step>
              <StepLabel>New Step</StepLabel>
            </Step>
          </Stepper>

          <div style={{margin: '0 16px'}}>

              <div>
                <p>{getStepContent(1)}</p>

              </div>

          </div>
</div>

}
export default WorkFlowStepper;
