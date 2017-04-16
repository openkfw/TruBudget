import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

import Origin from './Origin';
import { storeStreamName } from './actions';

class DetailWorkflowView extends Component {
  state = {
    stepIndex: 0,
  };

  handleNext = () => {
    const { stepIndex } = this.state;
    if (stepIndex === 0) {
      this.props.createSubProjectItem(this.props.location.pathname.substring(9), this.props.streamName)
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
        // return <Origin storeStreamName = {this.props.storeStreamName} />
        return <Origin storeStreamName={this.props.storeStreamName} />
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
        </Stepper>
        <div style={contentStyle}>
          <div>
            <p>{this.getStepContent(stepIndex)}</p>
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


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    storeStreamName: (name) => dispatch(storeStreamName(name))
  };
}

const mapStateToProps = (state) => {
  return {
    streamName: state.getIn(['subprojectCreation', 'streamName'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailWorkflowView);
