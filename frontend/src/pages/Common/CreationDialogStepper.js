import React from "react";

import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";

const getStepContent = ({ currentStep = 0, steps, ...props }) => {
  return steps[currentStep].content;
};

const styles = {
  contentStyle: { margin: "0 16px",  },
  multiStep: { width: "90%" }
};

const getSteps = (steps, editable, setCurrentStep) => {
  return steps
    .slice(0, steps.length)
    .map((step, index) => (
      <Step key={"stepper" + index}>
        {editable ? (
          <StepButton onClick={() => setCurrentStep(index)}>{step.title}</StepButton>
        ) : (
          <StepLabel>{step.title}</StepLabel>
        )}
      </Step>
    ));
};

const CreationDialogStepper = props => {
  const { steps, currentStep = 0, editable = false, setCurrentStep, numberOfSteps } = props;
  return (
    <div >
      {numberOfSteps > 1 ? (
        <Stepper style={styles.multiStep} nonLinear={editable} activeStep={currentStep}>
          {getSteps(steps, editable, setCurrentStep)}
        </Stepper>
      ) : null}
      <div style={styles.contentStyle}>
        <div>{getStepContent(props)}</div>
      </div>
    </div>
  );
};
export default CreationDialogStepper;
