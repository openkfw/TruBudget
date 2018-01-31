import React, { Component } from 'react';
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import strings from '../../localizeStrings'


class RoleSelection extends Component {
  state = {
    finished: false,
    stepIndex: 0,
  };

  handleNext = () => {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });
  };

  handlePrev = () => {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 });
    }
  };

  renderStepActions(step, index, lastStep) {
    const { stepIndex } = this.state;
    return (
      <div style={{ margin: '12px 0' }}>
        <RaisedButton
          label={stepIndex === lastStep ? strings.common.finish : strings.common.next}
          disableTouchRipple={true}
          disableFocusRipple={true}
          disabled={step.selectedRoles.length === 0}
          aria-label="nextrole"
          primary={true}
          onTouchTap={this.handleNext}
          style={{ marginRight: 12 }}
        />
        {index > 0 && (
          <FlatButton
            label={strings.common.back}
            disabled={stepIndex === 0}
            disableTouchRipple={true}
            disableFocusRipple={true}
            onTouchTap={this.handlePrev}
          />
        )}
      </div>
    );
  }

  renderSteps = (steps) => {
    const numberOfSteps = steps.length;
    return steps.map((step, index) =>
      <Step key={'steps' + index}>
        <StepLabel>{step.title}</StepLabel>
        <StepContent>
          {step.content}
          {this.renderStepActions(step, index, numberOfSteps - 1)}
        </StepContent>
      </Step>
    );
  }

  render = () => {
    const { steps } = this.props;
    const { stepIndex } = this.state;
    return (
      <Stepper activeStep={stepIndex} orientation="vertical">
        {this.renderSteps(steps)}
      </Stepper>
    );
  }

}

export default RoleSelection;
