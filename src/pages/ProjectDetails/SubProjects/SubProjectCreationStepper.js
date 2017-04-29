import React, {Component} from 'react';
import {Step, Stepper, StepLabel} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import ProjectCreationPurpose from '../../Overview/ProjectCreationPurpose';
import ProjectCreationAmount from '../../Overview/ProjectCreationAmount';
import ProjectCreationName from '../../Overview/ProjectCreationName';
class SubProjectCreationStepper extends Component {
  state = {
    stepIndex: 0
  };

  handleNext = () => {
    const {stepIndex} = this.state;
    this.setState({
     stepIndex: stepIndex + 1,
    });
    if (stepIndex === 2) {
      this.props.createSubProjectItem(this.props.location.pathname.split('/')[2], this.props.subProjectName, this.props.subProjectAmount, this.props.subProjectPurpose, this.props.subProjectCurrency)
      this.props.hideWorkflowDialog();
      this.props.storeSnackBarMessage(this.props.subProjectName + ' added to Sub-projects')
      this.props.showSnackBar();
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
        return <ProjectCreationName storeProjectName={this.props.storeSubProjectName}  projectName={this.props.subProjectName} type={'subproject'}/>
      case 1:
        return <ProjectCreationAmount storeProjectAmount={this.props.storeSubProjectAmount} storeProjectCurrency={this.props.storeSubProjectCurrency} projectAmount={this.props.subProjectAmount} projectCurrency={this.props.subProjectCurrency} type={'subproject'}/>
      case 2:
        return <ProjectCreationPurpose storeProjectPurpose={this.props.storeSubProjectPurpose}  projectPurpose={this.props.subProjectPurpose} type={'subproject'}/>
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
            <StepLabel>Sub-project name</StepLabel>
          </Step>
          <Step>
            <StepLabel>Sub-project budget amount</StepLabel>
          </Step>
          <Step>
            <StepLabel>Sub-project purpose</StepLabel>
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
