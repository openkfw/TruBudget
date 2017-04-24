import React, { Component } from 'react';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import ProjectCreationName from './ProjectCreationName';
import ProjectCreationAmount from './ProjectCreationAmount';
import ProjectCreationPurpose from './ProjectCreationPurpose'

class ProjectCreationStepper extends Component {
  state = {
    finished: false,
    stepIndex: 0,
  };

  handleNext = () => {
    const { stepIndex } = this.state;
    this.setState({
     stepIndex: stepIndex + 1,
   });
    if (stepIndex === 2) {
      this.props.createProject(this.props.projectName, this.props.projectAmount, this.props.projectPurpose, this.props.projectCurrency);
      this.props.hideWorkflowDialog();
      this.props.storeSnackBarMessage(this.props.projectName + ' added to the Projects')
      this.props.openSnackBar();
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

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return <ProjectCreationName storeProjectName={this.props.storeProjectName} projectName={this.props.projectName}/>
      case 1:
        return <ProjectCreationAmount storeProjectAmount={this.props.storeProjectAmount} storeProjectCurrency={this.props.storeProjectCurrency} projectAmount={this.props.projectAmount} projectCurrency={this.props.projectCurrency}/>
      case 2:
        return <ProjectCreationPurpose storeProjectPurpose={this.props.storeProjectPurpose} projectPurpose={this.props.projectPurpose}/>

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
          <div>
            <div>{this.getStepContent(stepIndex)}</div>
            <div style={{ marginTop: 12 }}>
              <FlatButton
                label="Back"
                onTouchTap={this.handlePrev}
                style={{ marginRight: 360 }}
              />
              <RaisedButton
                label={stepIndex === 2 ? 'Finish' : 'Next'}
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
