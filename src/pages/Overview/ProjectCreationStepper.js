import React, { Component } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import ProjectCreationTextfield from './ProjectCreationTextfield';

class ProjectCreationStepper extends Component {
  state = {
    finished: false,
    stepIndex: 0,
  };

  handleNext = () => {
    const { stepIndex } = this.state;
    if (stepIndex === 0) {
      this.props.createProject(this.props.projectName, '0')
      this.props.hideWorkflowDialog();
    }
  };

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (stepIndex === 0) {
      this.props.hideWorkflowDialog();
    }
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 });
    }
  };

  getStepContent(stepIndex, ) {
    switch (stepIndex) {
      case 0:
        return <ProjectCreationTextfield storeProjectName={this.props.storeProjectName} />
      default:
        return null;
    }
  }

  render() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 16px' };
    return (
      <div>
        <Stepper activeStep={stepIndex}>
        <Step>
          <StepLabel>New Step</StepLabel>
        </Step>
        <Step>
          <StepLabel>Done</StepLabel>
        </Step>
        </Stepper>
        <div style={contentStyle}>
          <div>
            <div>{this.getStepContent(stepIndex)}</div>
            <div style={{ marginTop: 12 }}>
              <FlatButton
                label="Back"
                onTouchTap={this.handlePrev}
                style={{ marginRight: 360 }}
              />
              <RaisedButton
                label={stepIndex === 0 ? 'Finish' : 'Next'}
                primary={true}
                style={{}}
                onTouchTap={this.handleNext}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
};

export default ProjectCreationStepper;
