import React, {Component} from 'react';
import {Step, Stepper, StepLabel} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import ProjectCreationName from '../../Overview/ProjectCreationName';
import ProjectCreationPurpose from '../../Overview/ProjectCreationPurpose';
import ProjectCreationAmount from '../../Overview/ProjectCreationAmount';
import ProjectCreationAdditionalData from '../../Overview/ProjectCreationAdditionalData';

class WorkflowCreationStepper extends Component {
  state = {
    stepIndex: 0
  };

  handleNext = () => {
    const {stepIndex} = this.state;
    this.setState({
     stepIndex: stepIndex + 1,
    });
    console.log('Stepindex ' + stepIndex);
    if (stepIndex === 5) {
          this.props.createWorkflowItem(this.props.storeWorkflowName, this.props.storeWorkflowAmount, this.props.storeWorkflowCurrency, this.props.storeWorkflowPurpose, this.props.storeWorkflowAdditionalData)
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

  getStepContent(stepIndex) {
  switch (stepIndex) {

    case 0:
      return <ProjectCreationName storeProjectName={this.props.storeWorkflowName} type={'workflow'}/>
    case 1:
      return <ProjectCreationAmount storeProjectAmount={this.props.storeWorkflowAmount} storeProjectCurrency={this.props.storeWorkflowCurrency} type={'workflow'}/>
    case 2:
      return <ProjectCreationPurpose storeProjectPurpose={this.props.storeWorkflowPurpose} type={'workflow'}/>
    case 3:
      return <span>Done</span>
    case 4:
      return <ProjectCreationAdditionalData storeWorkflowAdditionalData={this.props.storeWorkflowAdditionalData} />
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
            <StepLabel>Name</StepLabel>
          </Step>
          <Step>
            <StepLabel>Amount</StepLabel>
          </Step>
          <Step>
            <StepLabel>Purpose</StepLabel>
          </Step>
          <Step>
            <StepLabel>Documents</StepLabel>
          </Step>
          <Step>
            <StepLabel>Additional Data</StepLabel>
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
              <RaisedButton label={stepIndex === 4
                ? 'Finish'
                : 'Next'} primary={true} style={{}} onTouchTap={this.handleNext}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
};

export default WorkflowCreationStepper;
