import React from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';


import ProjectCreationRoles from '../Overview/ProjectCreationRoles';
import ProjectCreationThumbnail from '../Overview/ProjectCreationThumbnail';
import ProjectDetails from './ProjectDetails';

import strings from '../../localizeStrings'
const getStepContent = ({ creationStep, ...props }) => {
  switch (creationStep) {
    case 0:
      return <ProjectDetails {...props} />
    case 1:
      return <ProjectCreationRoles {...props} />
    case 2:
      return <ProjectCreationThumbnail {...props} />
    default:
      return null;
  }
}

const steps = [
  strings.project.project_name,
  strings.project.project_budget,
  strings.project.project_comment,
  strings.project.project_roles,
  strings.project.project_thumbnail
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
