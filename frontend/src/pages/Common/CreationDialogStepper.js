import React from "react";

import Divider from "@mui/material/Divider";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";

const getStepContent = ({ currentStep = 0, steps }) => {
  return steps[currentStep].content;
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

const CreationDialogStepper = (props) => {
  const { steps, currentStep = 0, editable = false, setCurrentStep, numberOfSteps } = props;
  return (
    <div>
      {numberOfSteps > 1 ? (
        <div className="stepper">
          <Stepper className="multi-step" nonLinear={editable} activeStep={currentStep}>
            {getSteps(steps, editable, setCurrentStep)}
          </Stepper>
          <Divider />
        </div>
      ) : null}
      <div className="content-style">
        <div>{getStepContent(props)}</div>
      </div>
    </div>
  );
};
export default CreationDialogStepper;
