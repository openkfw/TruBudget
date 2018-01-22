import React from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';

import ProjectCreationName from './ProjectCreationName';
import ProjectCreationAmount from './ProjectCreationAmount';
import ProjectCreationComment from './ProjectCreationComment';
import ProjectCreationRoles from './ProjectCreationRoles';
import strings from '../../localizeStrings'
const getStepContent = ({ creationStep, ...props }) => {
  switch (creationStep) {
    case 0:
      return <ProjectCreationName storeProjectName={props.storeProjectName} projectName={props.projectName} type={props.type} />
    case 1:
      return <ProjectCreationAmount storeProjectAmount={props.storeProjectAmount} storeProjectCurrency={props.storeProjectCurrency} projectAmount={props.projectAmount} projectCurrency={props.projectCurrency} parentCurrency={props.parentCurrency} type={props.type} />
    case 2:
      return <ProjectCreationComment storeProjectComment={props.storeProjectComment} projectComment={props.projectComment} type={props.type} />
    case 3:
      return <ProjectCreationRoles {...props} />
    case 4:
      return <div> <span> Placeholder</span></div>
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
