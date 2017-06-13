import React from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';

import ProjectCreationName from './ProjectCreationName';
import ProjectCreationAmount from './ProjectCreationAmount';
import ProjectCreationComment from './ProjectCreationComment';
import ProjectCreationRoles from './ProjectCreationRoles';

const getStepContent = ({ creationStep, ...props }) => {
  switch (creationStep) {
    case 0:
      return <ProjectCreationName storeProjectName={props.storeProjectName} projectName={props.projectName} />
    case 1:
      return <ProjectCreationAmount storeProjectAmount={props.storeProjectAmount} storeProjectCurrency={props.storeProjectCurrency} projectAmount={props.projectAmount} projectCurrency={props.projectCurrency} />
    case 2:
      return <ProjectCreationComment storeProjectPurpose={props.storeProjectPurpose} projectPurpose={props.projectPurpose} />
    case 3:
      return <ProjectCreationRoles {...props} />
    default:
      return null;
  }
}

const steps = [
  'Project Name',
  'Project Budget',
  'Project Comment',
  'Project Roles'
];

const getSteps = (numberOfSteps) => {
  return steps.slice(0, numberOfSteps).map((step, index) => (
    <Step key={'stepper' + index}>
      <StepLabel>{step}</StepLabel>
    </Step>)
  )
}

const ProjectCreationStepper = (props) => {
  const { numberOfSteps, creationStep } = props;
  const contentStyle = { margin: '0 16px' };
  return (
    <div>
      <Stepper activeStep={creationStep}>
        {getSteps(numberOfSteps)}
      </Stepper>
      <div style={contentStyle}>
        <div>{getStepContent(props)}</div>
      </div>
    </div>
  )
}
export default ProjectCreationStepper;
