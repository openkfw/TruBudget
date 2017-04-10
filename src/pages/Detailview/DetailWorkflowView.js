import React, { Component } from 'react';

import {Card, CardTitle} from 'material-ui/Card';
import { showNext } from './actions';

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

  componentWillMount() {
    this.props.showNext();
  }


  state = {
    finished: false,
    stepIndex: 0,
  };


  handleNext = () => {
    const {stepIndex} = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 3,
    });
  };

  handlePrev = () => {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  };



  getStepContent(stepIndex) {
   switch (stepIndex) {
     case 0:
       return <OriginatingStep/>
     case 1:
       return <ProcessSelection/>
     case 2:
       return  <AdditionalData/>
    case 3:
       return <Origin/>

   }
 }
  render() {
    const {finished, stepIndex} = this.state;
    const contentStyle = {margin: '0 16px'};
      return (
        <Card style={{
          width: '40%',
          left: '2%',
          top: '100px',
          position: 'absolute',
          zIndex: 1100,

        }}>
    <div style={{width: '100%', maxWidth: 700, margin: 'auto'}}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Originating Step</StepLabel>
          </Step>
          <Step>
            <StepLabel>New Step</StepLabel>
          </Step>
          <Step>
            <StepLabel>Additional Data</StepLabel>
          </Step>
          <Step>
            <StepLabel>Origin</StepLabel>
          </Step>
        </Stepper>
        <div style={contentStyle}>

            <div>
              <p>{this.getStepContent(stepIndex)}</p>
              <div style={{marginTop: 12}}>
                <FlatButton
                  label="Back"
                  disabled={stepIndex === 0}
                  onTouchTap={this.handlePrev}
                  style={{marginRight: 360}}
                />
                <RaisedButton
                  label={stepIndex === 3 ? 'Finish' : 'Next'}
                  primary={true}
                    style={{}}
                  onTouchTap={this.handleNext}
                />
              </div>
            </div>

        </div>
      </div>
        </Card>
    )
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    showNext: () => dispatch(showNext())
  };
}

const mapStateToProps = (state) => {
  console.log('Show Next is '+state.getIn(['detailview','showNext']) )
  return {
    showNext: state.getIn(['detailview','showNext'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailWorkflowView);
