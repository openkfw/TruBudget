import React from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';


import ProjectCreationRoles from '../Overview/ProjectCreationRoles';
import ProjectCreationThumbnail from '../Overview/ProjectCreationThumbnail';
import ProjectDialogContent from './ProjectDialogContent';

import strings from '../../localizeStrings'
const getStepContent = ({ creationStep, ...props }) => {
  switch (creationStep) {
    case 0:
      return <ProjectDialogContent {...props} />
    case 1:
      return <ProjectCreationRoles {...props} />

    default:
      return null;
  }
}

const steps = [
  strings.project.project_name,
  strings.project.project_roles,
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
