import React from 'react';
import { Step, Stepper, StepButton } from 'material-ui/Stepper';
import ProjectCreationName from '../Overview/ProjectCreationName';
import ProjectCreationComment from '../Overview/ProjectCreationComment';
import WorkflowCreationAmount from './WorkflowCreationAmount';
import WorkflowStateAndAssignee from './WorkflowStateAndAssignee';
import WorkflowType from './WorkflowType';
import DocumentUpload from '../Documents/DocumentUpload';
import strings from '../../localizeStrings'

const getStepContent = (props) => {
  switch (props.creationStep) {
    case 0:
      return <WorkflowType workflowType={props.workflowType} editMode={props.editMode} storeWorkflowType={props.storeWorkflowType} />
    case 1:
      return <ProjectCreationName storeProjectName={props.storeWorkflowName} projectName={props.workflowName} type={'workflow'} />
    case 2:
      return <WorkflowCreationAmount
        subProjectCurrency={props.subProjectDetails.currency}
        storeWorkflowAmount={props.storeWorkflowAmount}
        storeWorkflowAmountType={props.storeWorkflowAmountType}
        storeWorkflowCurrency={props.storeWorkflowCurrency}
        workflowAmount={props.workflowAmount}
        workflowAmountType={props.workflowAmountType}
        workflowCurrency={props.workflowCurrency}
      />
    case 3:
      return <ProjectCreationComment storeProjectComment={props.storeWorkflowComment} projectComment={props.workflowComment} type={'workflow'} />
    case 4:
      return <DocumentUpload addDocument={props.addDocument} workflowDocuments={props.workflowDocuments} />
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
            {strings.workflow.workflow_type}
          </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(1)}>
            {strings.workflow.workflow_name}
          </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(2)}>
            {strings.common.budget}
          </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(3)}>
            {strings.common.comment}
          </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(4)}>
            {strings.workflow.workflow_documents}
          </StepButton>
        </Step>
        <Step>
          <StepButton onClick={() => props.setWorkflowCreationStep(5)}>
            {strings.common.status}
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
