import React, { Component } from 'react';

import {Card, CardTitle} from 'material-ui/Card';

import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import ProcessSelection from './ProcessSelection';
import AdditionalData from './AdditionalData';
import Origin from './Origin';
import OriginatingStep from './OriginatingStep';
import { connect } from 'react-redux';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';



class DetailWorkflowView extends Component {



  state = {
    finished: false,
    stepIndex: 0,
  };


  handleNext = () => {
    const {stepIndex} = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 0,
    });
    if (stepIndex == 0){
        this.props.hideWorkflowDialog();
    }
  };

  handlePrev = () => {
    const {stepIndex} = this.state;
    if (stepIndex == 0 ){
        this.props.hideWorkflowDialog();
    }
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  };



  getStepContent(stepIndex) {
   switch (stepIndex){
    case 0:
       return <Origin/>

   }
 }
  render() {
    const {finished, stepIndex} = this.state;
    const contentStyle = {margin: '0 16px'};
      return (
  <div>

        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>New Step</StepLabel>
          </Step>
        </Stepper>
        <div style={contentStyle}>

            <div>
              <p>{this.getStepContent(stepIndex)}</p>
              <div style={{marginTop: 12}}>
                <FlatButton
                  label="Back"
                  onTouchTap={this.handlePrev}
                  style={{marginRight: 360}}
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



export default DetailWorkflowView;
