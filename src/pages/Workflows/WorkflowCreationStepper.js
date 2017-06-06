import React from 'react';
import { Step, Stepper, StepButton } from 'material-ui/Stepper';
import ProjectCreationName from '../Overview/ProjectCreationName';
import ProjectCreationPurpose from '../Overview/ProjectCreationPurpose';
import ProjectCreationAmount from '../Overview/ProjectCreationAmount';
import ProjectCreationAdditionalData from '../Overview/ProjectCreationAdditionalData';
import WorkflowStateAndAssignee from './WorkflowStateAndAssignee';
import WorkflowType from './WorkflowType';


const getStepContent = (props) => {
  switch (props.creationStep) {
    case 0:
      return <WorkflowType workflowType={props.workflowType} editMode={props.editMode} storeWorkflowType={props.storeWorkflowType} />
    case 1:
      return <ProjectCreationName storeProjectName={props.storeWorkflowName} projectName={props.workflowName} type={'workflow'} />
    case 2:
      return <ProjectCreationAmount storeProjectAmount={props.storeWorkflowAmount} storeProjectCurrency={props.storeWorkflowCurrency} projectAmount={props.workflowAmount} projectCurrency={props.workflowCurrency} type={'workflow'} />
    case 3:
      return <ProjectCreationPurpose storeProjectPurpose={props.storeWorkflowPurpose} projectPurpose={props.workflowPurpose} type={'workflow'} />
    case 4:
      return <ProjectCreationAdditionalData storeWorkflowAdditionalData={props.storeWorkflowAdditionalData} workflowAdditionalData={props.workflowAdditionalData} />
    case 5:
      return <WorkflowStateAndAssignee permissions={props.permissions} users={props.users} storeWorkflowState={props.storeWorkflowState} storeWorkflowAssignee={props.storeWorkflowAssignee} workflowAssignee={props.workflowAssignee} workflowState={props.workflowState} editMode={props.editMode} />
    default:
      return <span>Done</span>
  }
}
const WorkflowCreationStepper = (props) => {
  const contentStyle = {
    margin: '0 16px'
  };
  return (
    <div>
      <Stepper linear={!props.editMode} activeStep={props.creationStep}>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(0)}>
            Type
            </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(1)}>
            Name
            </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(2)}>
            Amount
            </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(3)}>
            Purpose
            </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(4)}>
            Additional Data
            </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(5)}>
            Status & Assignee
            </StepButton>
        </Step>
      </Stepper>
      <div style={contentStyle}>
        {getStepContent(props)}
      </div>
    </div>
  )
};

export default WorkflowCreationStepper;
