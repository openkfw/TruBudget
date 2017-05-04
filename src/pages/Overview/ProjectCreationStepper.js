import React, { Component } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';

import ProjectCreationName from './ProjectCreationName';
import ProjectCreationAmount from './ProjectCreationAmount';
import ProjectCreationPurpose from './ProjectCreationPurpose'

class ProjectCreationStepper extends Component {
  getStepContent(creationStep) {
    switch (creationStep) {
      case 0:
        return <ProjectCreationName storeProjectName={this.props.storeProjectName} projectName={this.props.projectName} />
      case 1:
        return <ProjectCreationAmount storeProjectAmount={this.props.storeProjectAmount} storeProjectCurrency={this.props.storeProjectCurrency} projectAmount={this.props.projectAmount} projectCurrency={this.props.projectCurrency} />
      case 2:
        return <ProjectCreationPurpose storeProjectPurpose={this.props.storeProjectPurpose} projectPurpose={this.props.projectPurpose} />

      default:
        return null;
    }
  }

  render() {
    const { creationStep } = this.props;
    const contentStyle = { margin: '0 16px' };
    return (
      <div>
        <Stepper activeStep={creationStep}>
          <Step>
            <StepLabel>Project Name</StepLabel>
          </Step>
          <Step>
            <StepLabel>Project Amount</StepLabel>
          </Step>
          <Step>
            <StepLabel>Project Purpose</StepLabel>
          </Step>
        </Stepper>
        <div style={contentStyle}>
          <div>{this.getStepContent(creationStep)}</div>
        </div>
      </div>
    )
  }
};

export default ProjectCreationStepper;
