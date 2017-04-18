import React, {Component} from 'react';
import {Step, Stepper, StepLabel} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import SubProjectCreationName from './SubProjectCreationName';
import SubProjectCreationAmount from './SubProjectCreationAmount';
import SubProjectCreationPurpose from './SubProjectCreationPurpose';
class SubProjectCreationStepper extends Component {
  state = {
    stepIndex: 0
  };

  handleNext = () => {
    const {stepIndex} = this.state;
    this.setState({
     stepIndex: stepIndex + 1,
    });
    console.log('Stepindex ' + stepIndex);
    if (stepIndex === 2) {
      this.props.createSubProjectItem(this.props.location.pathname.substring(9), this.props.subProjectName, this.props.subProjectAmount, this.props.subProjectPurpose)
      this.props.hideWorkflowDialog();
    }
  };

  handlePrev = () => {
    const {stepIndex} = this.state;
    if (stepIndex === 0) {
      this.props.hideWorkflowDialog();
    }
    if (stepIndex > 0) {
      this.setState({
        stepIndex: stepIndex - 1
      });
    }
  };

  getStepContent(stepIndex,) {

    switch (stepIndex) {
      case 0:
        return <SubProjectCreationName storeSubProjectName={this.props.storeSubProjectName}/>
      case 1:
        return <SubProjectCreationAmount storeSubProjectAmount={this.props.storeSubProjectName}/>
      case 2:
        return <SubProjectCreationPurpose storeSubProjectPurpose={this.props.storeSubProjectName}/>
      default:
        return <span>Done</span>;
    }
  }

  render() {
    const {stepIndex} = this.state;
    const contentStyle = {
      margin: '0 16px'
    };
    return (
      <div>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Sub-Project Name</StepLabel>
          </Step>
          <Step>
            <StepLabel>Sub-Project Amount</StepLabel>
          </Step>
          <Step>
            <StepLabel>Sub-Project Purpose</StepLabel>
          </Step>
          <Step>
            <StepLabel>Done</StepLabel>
          </Step>
        </Stepper>
        <div style={contentStyle}>
          <div>
            <div>{this.getStepContent(stepIndex)}</div>
            <div style={{
              marginTop: 12
            }}>
              <FlatButton label="Back" onTouchTap={this.handlePrev} style={{
                marginRight: 360
              }}/>
              <RaisedButton label={stepIndex === 2
                ? 'Finish'
                : 'Next'} primary={true} style={{}} onTouchTap={this.handleNext}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
};

export default SubProjectCreationStepper;
